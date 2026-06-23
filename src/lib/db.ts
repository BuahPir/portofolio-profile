/* ── Types ── */
export type Priority = 'low' | 'medium' | 'high'
export type ColumnId = 'todo' | 'progress' | 'done'

export interface Project {
  id: string
  name: string
  description: string
  dueDate: string
  createdAt: string
}

export interface Task {
  id: string
  projectId: string
  title: string
  description: string
  priority: Priority
  link: string
  createdAt: string
  columnId: ColumnId
}

/* ── Helpers ── */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

/* ── IndexedDB Setup ── */
const DB_NAME = 'task-manager-db'
const DB_VERSION = 1
const PROJECTS_STORE = 'projects'
const TASKS_STORE = 'tasks'
const OLD_STORAGE_KEY = 'task-manager-tasks'

let dbInstance: IDBDatabase | null = null

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance)

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
        db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' })
      }

      if (!db.objectStoreNames.contains(TASKS_STORE)) {
        const store = db.createObjectStore(TASKS_STORE, { keyPath: 'id' })
        store.createIndex('projectId', 'projectId', { unique: false })
      }

      // Mark that migration is needed after upgrade completes
      const tx = (event.target as IDBOpenDBRequest).transaction!
      tx.oncomplete = () => {
        // DB is ready — migration will happen on first call to initDB
      }
    }

    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }

    request.onerror = () => reject(request.error)
  })
}

/** Initialize the database and migrate old localStorage data if present. */
export async function initDB(): Promise<void> {
  const db = await openDB()

  // Check if migration from localStorage is needed
  const raw = localStorage.getItem(OLD_STORAGE_KEY)
  if (!raw) return

  try {
    const oldTasks = JSON.parse(raw) as Array<{
      id: string
      title: string
      description: string
      priority: Priority
      link?: string
      createdAt: string
      columnId: ColumnId
    }>

    if (!oldTasks.length) {
      localStorage.removeItem(OLD_STORAGE_KEY)
      return
    }

    // Create a default project for migrated tasks
    const projectId = generateId()
    const project: Project = {
      id: projectId,
      name: 'My First Project',
      description: 'Migrated from your previous task list.',
      dueDate: '',
      createdAt: new Date().toISOString(),
    }

    const tx = db.transaction([PROJECTS_STORE, TASKS_STORE], 'readwrite')
    const projectStore = tx.objectStore(PROJECTS_STORE)
    const taskStore = tx.objectStore(TASKS_STORE)

    projectStore.add(project)

    for (const old of oldTasks) {
      const task: Task = {
        id: old.id,
        projectId,
        title: old.title,
        description: old.description,
        priority: old.priority,
        link: old.link ?? '',
        createdAt: old.createdAt,
        columnId: old.columnId,
      }
      taskStore.add(task)
    }

    await txComplete(tx)
    localStorage.removeItem(OLD_STORAGE_KEY)
  } catch {
    // If migration fails, leave localStorage intact for retry
  }
}

/* ── Transaction helper ── */
function txComplete(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

function storeGetAll<T>(store: IDBObjectStore): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result as T[])
    request.onerror = () => reject(request.error)
  })
}

function storeGet<T>(store: IDBObjectStore, key: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const request = store.get(key)
    request.onsuccess = () => resolve(request.result as T | undefined)
    request.onerror = () => reject(request.error)
  })
}

function indexGetAll<T>(index: IDBIndex, key: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const request = index.getAll(key)
    request.onsuccess = () => resolve(request.result as T[])
    request.onerror = () => reject(request.error)
  })
}

/* ── Project CRUD ── */
export async function getAllProjects(): Promise<Project[]> {
  const db = await openDB()
  const tx = db.transaction(PROJECTS_STORE, 'readonly')
  const store = tx.objectStore(PROJECTS_STORE)
  return storeGetAll<Project>(store)
}

export async function getProject(id: string): Promise<Project | undefined> {
  const db = await openDB()
  const tx = db.transaction(PROJECTS_STORE, 'readonly')
  const store = tx.objectStore(PROJECTS_STORE)
  return storeGet<Project>(store, id)
}

export async function addProject(project: Project): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(PROJECTS_STORE, 'readwrite')
  tx.objectStore(PROJECTS_STORE).add(project)
  await txComplete(tx)
}

export async function updateProject(project: Project): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(PROJECTS_STORE, 'readwrite')
  tx.objectStore(PROJECTS_STORE).put(project)
  await txComplete(tx)
}

export async function deleteProject(id: string): Promise<void> {
  const db = await openDB()
  const tx = db.transaction([PROJECTS_STORE, TASKS_STORE], 'readwrite')

  // Delete the project
  tx.objectStore(PROJECTS_STORE).delete(id)

  // Delete all tasks belonging to this project
  const taskStore = tx.objectStore(TASKS_STORE)
  const index = taskStore.index('projectId')
  const tasks = await indexGetAll<Task>(index, id)
  for (const task of tasks) {
    taskStore.delete(task.id)
  }

  await txComplete(tx)
}

/* ── Task CRUD ── */
export async function getTasksByProject(projectId: string): Promise<Task[]> {
  const db = await openDB()
  const tx = db.transaction(TASKS_STORE, 'readonly')
  const index = tx.objectStore(TASKS_STORE).index('projectId')
  return indexGetAll<Task>(index, projectId)
}

export async function addTask(task: Task): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(TASKS_STORE, 'readwrite')
  tx.objectStore(TASKS_STORE).add(task)
  await txComplete(tx)
}

export async function updateTask(task: Task): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(TASKS_STORE, 'readwrite')
  tx.objectStore(TASKS_STORE).put(task)
  await txComplete(tx)
}

export async function deleteTask(id: string): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(TASKS_STORE, 'readwrite')
  tx.objectStore(TASKS_STORE).delete(id)
  await txComplete(tx)
}
