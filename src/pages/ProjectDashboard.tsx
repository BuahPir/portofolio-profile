import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import {
  initDB,
  getAllProjects,
  addProject,
  updateProject,
  deleteProject,
  getTasksByProject,
  generateId,
  type Project,
  type Task,
} from '../lib/db'
import './ProjectDashboard.css'

/* ── Icons ── */
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
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

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

/* ── Helpers ── */
function formatDate(iso: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getDueStatus(dueDate: string): 'overdue' | 'upcoming' | 'none' {
  if (!dueDate) return 'none'
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  return due < now ? 'overdue' : 'upcoming'
}

/* ── Project Modal ── */
interface ModalProps {
  editingProject?: Project | null
  onClose: () => void
  onSubmit: (data: Omit<Project, 'id' | 'createdAt'>) => void
}

function ProjectModal({ editingProject, onClose, onSubmit }: ModalProps) {
  const isEdit = !!editingProject
  const [name, setName] = useState(editingProject?.name ?? '')
  const [description, setDescription] = useState(editingProject?.description ?? '')
  const [dueDate, setDueDate] = useState(editingProject?.dueDate ?? '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      dueDate,
    })
    onClose()
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal" role="dialog" aria-labelledby="modal-title">
        <h2 id="modal-title">{isEdit ? 'Edit Project' : 'New Project'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="project-name">Project Name</label>
            <input
              ref={inputRef}
              id="project-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Website Redesign"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="project-desc">Description</label>
            <textarea
              id="project-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about? (optional)"
            />
          </div>
          <div className="form-group">
            <label htmlFor="project-due">Due Date</label>
            <input
              id="project-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              {isEdit ? 'Update' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Delete Confirmation Modal ── */
interface ConfirmProps {
  projectName: string
  onClose: () => void
  onConfirm: () => void
}

function ConfirmDeleteModal({ projectName, onClose, onConfirm }: ConfirmProps) {
  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal" role="dialog" aria-labelledby="confirm-title">
        <h2 id="confirm-title">Delete Project</h2>
        <p className="confirm-text">
          Are you sure you want to delete <strong>"{projectName}"</strong>?
        </p>
        <p className="confirm-warning">
          All tasks in this project will be permanently deleted.
        </p>
        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Project Card ── */
interface ProjectCardProps {
  project: Project
  taskCounts: { todo: number; progress: number; done: number }
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

function ProjectCard({ project, taskCounts, onEdit, onDelete }: ProjectCardProps) {
  const navigate = useNavigate()
  const dueStatus = getDueStatus(project.dueDate)

  function handleClick() {
    navigate(`/task_manager/${project.id}`)
  }

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation()
    onEdit(project)
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    onDelete(project)
  }

  return (
    <div className="project-card" onClick={handleClick} role="button" tabIndex={0}>
      <div className="project-card-top">
        <h3 className="project-card-name">{project.name}</h3>
        <div className="project-card-actions">
          <button
            className="project-action-btn"
            onClick={handleEdit}
            aria-label={`Edit "${project.name}"`}
            title="Edit project"
          >
            <PencilIcon />
          </button>
          <button
            className="project-action-btn delete-btn"
            onClick={handleDelete}
            aria-label={`Delete "${project.name}"`}
            title="Delete project"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
      {project.description && (
        <p className="project-card-desc">{project.description}</p>
      )}
      <div className="project-card-footer">
        <div className="project-counts">
          <span className="project-count">
            <span className="project-count-dot project-count-dot--todo" />
            {taskCounts.todo}
          </span>
          <span className="project-count">
            <span className="project-count-dot project-count-dot--progress" />
            {taskCounts.progress}
          </span>
          <span className="project-count">
            <span className="project-count-dot project-count-dot--done" />
            {taskCounts.done}
          </span>
        </div>
        {project.dueDate && (
          <span className={`project-due project-due--${dueStatus}`}>
            <CalendarIcon />
            {formatDate(project.dueDate)}
          </span>
        )}
      </div>
    </div>
  )
}

/* ── Main Component ── */
interface ProjectWithCounts {
  project: Project
  counts: { todo: number; progress: number; done: number }
}

function ProjectDashboard() {
  const [items, setItems] = useState<ProjectWithCounts[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)

  const loadProjects = useCallback(async () => {
    await initDB()
    const projects = await getAllProjects()

    const withCounts: ProjectWithCounts[] = await Promise.all(
      projects.map(async (project) => {
        const tasks = await getTasksByProject(project.id)
        return {
          project,
          counts: {
            todo: tasks.filter((t: Task) => t.columnId === 'todo').length,
            progress: tasks.filter((t: Task) => t.columnId === 'progress').length,
            done: tasks.filter((t: Task) => t.columnId === 'done').length,
          },
        }
      }),
    )

    // Sort: newest first
    withCounts.sort(
      (a, b) =>
        new Date(b.project.createdAt).getTime() -
        new Date(a.project.createdAt).getTime(),
    )

    setItems(withCounts)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  async function handleAddProject(data: Omit<Project, 'id' | 'createdAt'>) {
    const project: Project = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    await addProject(project)
    await loadProjects()
  }

  async function handleUpdateProject(data: Omit<Project, 'id' | 'createdAt'>) {
    if (!editingProject) return
    await updateProject({ ...editingProject, ...data })
    setEditingProject(null)
    await loadProjects()
  }

  async function handleDeleteProject() {
    if (!deletingProject) return
    await deleteProject(deletingProject.id)
    setDeletingProject(null)
    await loadProjects()
  }

  function openEditModal(project: Project) {
    setEditingProject(project)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingProject(null)
  }

  return (
    <div className="projects-page">
      <header className="projects-header">
        <div className="projects-header-top">
          <Link to="/" className="back-link">
            &larr; Back to Portfolio
          </Link>
          <ThemeToggle />
        </div>
        <div className="projects-header-row">
          <h1>Task Manager</h1>
          <button
            className="header-add-btn"
            onClick={() => {
              setEditingProject(null)
              setShowModal(true)
            }}
            aria-label="Create new project"
          >
            <PlusIcon />
            <span>New Project</span>
          </button>
        </div>
        <p className="projects-intro">
          Organize your work into projects. Each project has its own Kanban
          board to track tasks.
        </p>
      </header>

      <div className="projects-content">
        {loading && (
          <div className="projects-loading">Loading projects...</div>
        )}

        {!loading && items.length === 0 && (
          <div className="projects-empty">
            <FolderIcon />
            <h2>No projects yet</h2>
            <p>Create your first project to start organizing tasks.</p>
            <button
              className="header-add-btn"
              onClick={() => setShowModal(true)}
            >
              <PlusIcon />
              <span>New Project</span>
            </button>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="projects-grid">
            {items.map(({ project, counts }) => (
              <ProjectCard
                key={project.id}
                project={project}
                taskCounts={counts}
                onEdit={openEditModal}
                onDelete={setDeletingProject}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <ProjectModal
          editingProject={editingProject}
          onClose={closeModal}
          onSubmit={editingProject ? handleUpdateProject : handleAddProject}
        />
      )}

      {/* Delete Confirmation */}
      {deletingProject && (
        <ConfirmDeleteModal
          projectName={deletingProject.name}
          onClose={() => setDeletingProject(null)}
          onConfirm={handleDeleteProject}
        />
      )}
    </div>
  )
}

export default ProjectDashboard
