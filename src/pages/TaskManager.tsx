import { useState, useRef, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import './TaskManager.css'

/* ── Types ── */
type Priority = 'low' | 'medium' | 'high'
type ColumnId = 'todo' | 'progress' | 'done'

interface Task {
  id: string
  title: string
  description: string
  priority: Priority
  link: string
  createdAt: string
  columnId: ColumnId
}

interface Column {
  id: ColumnId
  label: string
  dotClass: string
}

const COLUMNS: Column[] = [
  { id: 'todo', label: 'To Do', dotClass: 'column-dot--todo' },
  { id: 'progress', label: 'In Progress', dotClass: 'column-dot--progress' },
  { id: 'done', label: 'Done', dotClass: 'column-dot--done' },
]

const STORAGE_KEY = 'task-manager-tasks'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Task[]
      // migrate old tasks without link field
      return parsed.map((t) => ({ ...t, link: t.link ?? '' }))
    }
  } catch {
    // ignore
  }
  return getDefaultTasks()
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

function getDefaultTasks(): Task[] {
  const now = new Date().toISOString()
  return [
    {
      id: generateId(),
      title: 'Design landing page',
      description:
        'Create wireframes and high-fidelity mockups for the new landing page.',
      priority: 'high',
      link: 'https://www.figma.com',
      createdAt: now,
      columnId: 'todo',
    },
    {
      id: generateId(),
      title: 'Set up project repo',
      description:
        'Initialize Git repository with CI/CD pipeline and branch protection rules.',
      priority: 'medium',
      link: 'https://github.com',
      createdAt: now,
      columnId: 'todo',
    },
    {
      id: generateId(),
      title: 'Build navigation component',
      description:
        'Create responsive nav bar with mobile hamburger menu and smooth transitions.',
      priority: 'medium',
      link: '',
      createdAt: now,
      columnId: 'progress',
    },
    {
      id: generateId(),
      title: 'Write API documentation',
      description:
        'Document all REST endpoints with request/response examples.',
      priority: 'low',
      link: '',
      createdAt: now,
      columnId: 'done',
    },
  ]
}

/* ── Icons ── */
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  )
}

function ClipboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  )
}

/* ── Task Modal (Add & Edit) ── */
interface ModalProps {
  editingTask?: Task | null
  columnId: ColumnId
  onClose: () => void
  onSubmit: (data: Omit<Task, 'id' | 'createdAt'>) => void
}

function TaskModal({ editingTask, columnId, onClose, onSubmit }: ModalProps) {
  const isEdit = !!editingTask
  const [title, setTitle] = useState(editingTask?.title ?? '')
  const [description, setDescription] = useState(editingTask?.description ?? '')
  const [priority, setPriority] = useState<Priority>(editingTask?.priority ?? 'medium')
  const [link, setLink] = useState(editingTask?.link ?? '')
  const [targetColumn, setTargetColumn] = useState<ColumnId>(editingTask?.columnId ?? columnId)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      link: link.trim(),
      columnId: targetColumn,
    })
    onClose()
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal" role="dialog" aria-labelledby="modal-title">
        <h2 id="modal-title">{isEdit ? 'Edit Task' : 'New Task'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="task-title">Title</label>
            <input
              ref={inputRef}
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="task-desc">Description</label>
            <textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details (optional)"
            />
          </div>
          <div className="form-group">
            <label htmlFor="task-link">Link</label>
            <input
              id="task-link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://www.figma.com (optional)"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="task-column">Column</label>
              <select
                id="task-column"
                value={targetColumn}
                onChange={(e) => setTargetColumn(e.target.value as ColumnId)}
              >
                {COLUMNS.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              {isEdit ? 'Update Task' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Task Card ── */
interface TaskCardProps {
  task: Task
  onDelete: (id: string) => void
  onEdit: (task: Task) => void
  onDragStart: (e: React.DragEvent, taskId: string) => void
  onDragEnd: () => void
}

function TaskCard({ task, onDelete, onEdit, onDragStart, onDragEnd }: TaskCardProps) {
  const [isDragging, setIsDragging] = useState(false)

  function handleDragStart(e: React.DragEvent) {
    setIsDragging(true)
    onDragStart(e, task.id)
  }

  function handleDragEnd() {
    setIsDragging(false)
    onDragEnd()
  }

  return (
    <div
      className={`task-card${isDragging ? ' dragging' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="task-card-top">
        <h3 className="task-card-title">{task.title}</h3>
        <div className="task-card-actions">
          <button
            className="task-action-btn task-edit-btn"
            onClick={() => onEdit(task)}
            aria-label={`Edit "${task.title}"`}
            title="Edit task"
          >
            <PencilIcon />
          </button>
          <button
            className="task-action-btn task-delete-btn"
            onClick={() => onDelete(task.id)}
            aria-label={`Delete "${task.title}"`}
            title="Delete task"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
      {task.description && (
        <p className="task-card-desc">{task.description}</p>
      )}
      {task.link && (
        <a
          href={task.link}
          target="_blank"
          rel="noreferrer"
          className="task-card-link"
        >
          <LinkIcon />
          <span>{task.link.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</span>
        </a>
      )}
      <div className="task-card-footer">
        <div className="task-card-meta">
          <span className={`priority-badge priority-badge--${task.priority}`}>
            {task.priority}
          </span>
        </div>
        <span className="task-card-date">{formatDate(task.createdAt)}</span>
      </div>
    </div>
  )
}

/* ── Main Component ── */
function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks)
  const [modalColumn, setModalColumn] = useState<ColumnId | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<ColumnId | null>(null)
  const draggedTaskId = useRef<string | null>(null)

  // persist
  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  const addTask = useCallback((data: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [newTask, ...prev])
  }, [])

  const updateTask = useCallback(
    (data: Omit<Task, 'id' | 'createdAt'>) => {
      if (!editingTask) return
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id ? { ...t, ...data } : t,
        ),
      )
    },
    [editingTask],
  )

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }, [])

  function openEditModal(task: Task) {
    setEditingTask(task)
    setModalColumn(task.columnId)
  }

  function closeModal() {
    setModalColumn(null)
    setEditingTask(null)
  }

  function handleModalSubmit(data: Omit<Task, 'id' | 'createdAt'>) {
    if (editingTask) {
      updateTask(data)
    } else {
      addTask(data)
    }
  }

  /* ── Drag & Drop ── */
  function handleDragStart(_e: React.DragEvent, taskId: string) {
    draggedTaskId.current = taskId
  }

  function handleDragEnd() {
    draggedTaskId.current = null
    setDragOverColumn(null)
  }

  function handleDragOver(e: React.DragEvent, columnId: ColumnId) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(columnId)
  }

  function handleDragLeave(e: React.DragEvent, columnId: ColumnId) {
    const relatedTarget = e.relatedTarget as HTMLElement | null
    const currentTarget = e.currentTarget as HTMLElement
    if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
      if (dragOverColumn === columnId) {
        setDragOverColumn(null)
      }
    }
  }

  function handleDrop(e: React.DragEvent, columnId: ColumnId) {
    e.preventDefault()
    setDragOverColumn(null)

    const taskId = draggedTaskId.current
    if (!taskId) return

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, columnId } : t)),
    )
    draggedTaskId.current = null
  }

  /* ── Stats ── */
  const todoCount = tasks.filter((t) => t.columnId === 'todo').length
  const progressCount = tasks.filter((t) => t.columnId === 'progress').length
  const doneCount = tasks.filter((t) => t.columnId === 'done').length
  const totalCount = tasks.length

  return (
    <div className="task-page">
      <header className="task-header">
        <div className="task-header-top">
          <Link to="/" className="back-link">
            &larr; Back to Portfolio
          </Link>
          <ThemeToggle />
        </div>
        <div className="task-header-row">
          <h1>Task Manager</h1>
          <button
            className="header-add-btn"
            onClick={() => setModalColumn('todo')}
            aria-label="Add new task"
          >
            <PlusIcon />
            <span>New Task</span>
          </button>
        </div>
        <p className="task-intro">
          Drag and drop tasks between columns to track your progress. Data is
          saved in your browser.
        </p>
      </header>

      {/* Stats */}
      <div className="task-stats">
        <div className="task-stat">
          Total: <strong>{totalCount}</strong>
        </div>
        <div className="task-stat">
          To Do: <strong>{todoCount}</strong>
        </div>
        <div className="task-stat">
          In Progress: <strong>{progressCount}</strong>
        </div>
        <div className="task-stat">
          Done: <strong>{doneCount}</strong>
        </div>
      </div>

      {/* Board */}
      <div className="task-board">
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.columnId === col.id)
          const isOver = dragOverColumn === col.id

          return (
            <div
              key={col.id}
              className={`task-column${isOver ? ' drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={(e) => handleDragLeave(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="column-header">
                <div className="column-title-group">
                  <span className={`column-dot ${col.dotClass}`} />
                  <span className="column-title">{col.label}</span>
                  <span className="column-count">{columnTasks.length}</span>
                </div>
              </div>
              <div className="column-body">
                {columnTasks.length === 0 && !isOver && (
                  <div className="empty-state">
                    <ClipboardIcon />
                    <p>No tasks yet</p>
                  </div>
                )}
                {isOver && columnTasks.length === 0 && (
                  <div className="drop-placeholder">Drop here</div>
                )}
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDelete={deleteTask}
                    onEdit={openEditModal}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  />
                ))}
                <button
                  className="add-task-btn"
                  onClick={() => setModalColumn(col.id)}
                  aria-label={`Add task to ${col.label}`}
                >
                  <PlusIcon />
                  Add task
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {modalColumn !== null && (
        <TaskModal
          editingTask={editingTask}
          columnId={modalColumn}
          onClose={closeModal}
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  )
}

export default TaskManager
