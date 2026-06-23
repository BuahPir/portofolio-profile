import { useState, useRef, useCallback, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import {
  initDB,
  getProject,
  getTasksByProject,
  addTask as dbAddTask,
  updateTask as dbUpdateTask,
  deleteTask as dbDeleteTask,
  generateId,
  type Task,
  type Project,
  type Priority,
  type ColumnId,
} from '../lib/db'
import './TaskManager.css'

/* ── Column config ── */
interface ColumnDef {
  id: ColumnId
  label: string
  dotClass: string
}

const COLUMNS: ColumnDef[] = [
  { id: 'todo', label: 'To Do', dotClass: 'column-dot--todo' },
  { id: 'progress', label: 'In Progress', dotClass: 'column-dot--progress' },
  { id: 'done', label: 'Done', dotClass: 'column-dot--done' },
]

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
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
  projectId: string
  onClose: () => void
  onSubmit: (data: Omit<Task, 'id' | 'createdAt'>) => void
}

function TaskModal({ editingTask, columnId, projectId, onClose, onSubmit }: ModalProps) {
  const isEdit = !!editingTask
  const [title, setTitle] = useState(editingTask?.title ?? '')
  const [description, setDescription] = useState(editingTask?.description ?? '')
  const [priority, setPriority] = useState<Priority>(editingTask?.priority ?? 'medium')
  const [link, setLink] = useState(editingTask?.link ?? '')
  const [targetColumn, setTargetColumn] = useState<ColumnId>(editingTask?.column_id ?? columnId)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({
      project_id: projectId,
      title: title.trim(),
      description: description.trim() || null,
      priority,
      link: link.trim() || null,
      column_id: targetColumn,
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
          onClick={(e) => e.stopPropagation()}
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
        <span className="task-card-date">{formatDate(task.created_at)}</span>
      </div>
    </div>
  )
}

/* ── Main Component ── */
function TaskManager() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalColumn, setModalColumn] = useState<ColumnId | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<ColumnId | null>(null)
  const draggedTaskId = useRef<string | null>(null)

  // Load project and tasks from IndexedDB
  const loadData = useCallback(async () => {
    if (!projectId) return
    try {
      setError(null)
      await initDB()

      const proj = await getProject(projectId)
      if (!proj) {
        // Project doesn't exist — go back to dashboard
        navigate('/task_manager', { replace: true })
        return
      }

      setProject(proj)
      const taskList = await getTasksByProject(projectId)
      setTasks(taskList)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to load project from Database.')
    } finally {
      setLoading(false)
    }
  }, [projectId, navigate])

  useEffect(() => {
    loadData()
  }, [loadData])

  // ── Task CRUD (async) ──
  async function handleAddTask(data: Omit<Task, 'id' | 'created_at'>) {
    const newTask: Task = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString(),
    }
    await dbAddTask(newTask)
    setTasks((prev) => [newTask, ...prev])
  }

  async function handleUpdateTask(data: Omit<Task, 'id' | 'created_at'>) {
    if (!editingTask) return
    const updated: Task = { ...editingTask, ...data }
    await dbUpdateTask(updated)
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  async function handleDeleteTask(id: string) {
    await dbDeleteTask(id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  function openEditModal(task: Task) {
    setEditingTask(task)
    setModalColumn(task.column_id)
  }

  function closeModal() {
    setModalColumn(null)
    setEditingTask(null)
  }

  function handleModalSubmit(data: Omit<Task, 'id' | 'created_at'>) {
    if (editingTask) {
      handleUpdateTask(data)
    } else {
      handleAddTask(data)
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

  async function handleDrop(e: React.DragEvent, columnId: ColumnId) {
    e.preventDefault()
    setDragOverColumn(null)

    const taskId = draggedTaskId.current
    if (!taskId) return

    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.column_id === columnId) {
      draggedTaskId.current = null
      return
    }

    const updated = { ...task, column_id: columnId }
    await dbUpdateTask(updated)
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)))
    draggedTaskId.current = null
  }

  /* ── Stats ── */
  const todoCount = tasks.filter((t) => t.column_id === 'todo').length
  const progressCount = tasks.filter((t) => t.column_id === 'progress').length
  const doneCount = tasks.filter((t) => t.column_id === 'done').length
  const totalCount = tasks.length

  if (loading || error) {
    return (
      <div className="task-page">
        <header className="task-header">
          <div className="task-header-top">
            <Link to="/task_manager" className="back-link">
              &larr; Back to Projects
            </Link>
            <ThemeToggle />
          </div>
          {loading && <h1>Loading...</h1>}
          {error && (
            <div style={{ color: '#ef4444', marginTop: '20px' }}>
              <h2>Database Error</h2>
              <p>{error}</p>
              <p style={{ fontSize: '13px' }}>Check browser console for more details.</p>
            </div>
          )}
        </header>
      </div>
    )
  }

  return (
    <div className="task-page">
      <header className="task-header">
        <div className="task-header-top">
          <Link to="/task_manager" className="back-link">
            &larr; Back to Projects
          </Link>
          <ThemeToggle />
        </div>
        <div className="task-header-row">
          <h1>{project?.name ?? 'Task Manager'}</h1>
          <button
            className="header-add-btn"
            onClick={() => setModalColumn('todo')}
            aria-label="Add new task"
          >
            <PlusIcon />
            <span>New Task</span>
          </button>
        </div>
        {project?.description && (
          <p className="task-intro">{project.description}</p>
        )}
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
          const columnTasks = tasks.filter((t) => t.column_id === col.id)
          const isDragOver = dragOverColumn === col.id

          return (
            <div
              key={col.id}
              className={`task-column${isDragOver ? ' drag-over' : ''}`}
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
                {columnTasks.length === 0 && !isDragOver && (
                  <div className="empty-state">
                    <ClipboardIcon />
                    <p>No tasks yet</p>
                  </div>
                )}
                {isDragOver && columnTasks.length === 0 && (
                  <div className="drop-placeholder">Drop here</div>
                )}
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDelete={handleDeleteTask}
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
      {modalColumn !== null && projectId && (
        <TaskModal
          editingTask={editingTask}
          columnId={modalColumn}
          projectId={projectId}
          onClose={closeModal}
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  )
}

export default TaskManager
