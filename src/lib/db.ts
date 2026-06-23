import { createClient } from '@supabase/supabase-js'

/* ── Supabase Setup ── */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
export const supabase = createClient(supabaseUrl, supabaseKey)

/* ── Types ── */
export type Priority = 'low' | 'medium' | 'high'
export type ColumnId = 'todo' | 'progress' | 'done'

export interface Project {
  id: string
  name: string
  description: string | null
  due_date: string | null
  created_at: string
}

export interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  priority: Priority
  link: string | null
  created_at: string
  column_id: ColumnId
}

/* ── Helpers ── */
export function generateId(): string {
  // Generate a standard UUID in case the Supabase table expects UUIDs
  return crypto.randomUUID()
}

/** 
 * No longer requires IndexedDB initialization.
 * We keep the signature so ProjectDashboard doesn't break.
 */
export async function initDB(): Promise<void> {
  // If keys are missing, we could throw a warning here
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL or Key is missing. Please check your .env file.')
  }
}

/* ── Project CRUD ── */
export async function getAllProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Project[]
}

export async function getProject(id: string): Promise<Project | undefined> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
  return data || undefined
}

export async function addProject(project: Project): Promise<void> {
  const { error } = await supabase.from('projects').insert([project])
  if (error) throw error
}

export async function updateProject(project: Project): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update(project)
    .eq('id', project.id)

  if (error) throw error
}

export async function deleteProject(id: string): Promise<void> {
  // Cascading delete is handled by PostgreSQL schema
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}

/* ── Task CRUD ── */
export async function getTasksByProject(projectId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as Task[]
}

export async function addTask(task: Task): Promise<void> {
  const { error } = await supabase.from('tasks').insert([task])
  if (error) throw error
}

export async function updateTask(task: Task): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update(task)
    .eq('id', task.id)

  if (error) throw error
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}
