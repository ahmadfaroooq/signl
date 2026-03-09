import { create } from 'zustand'
import type { SopTemplate, SopInstance, ProjectTask } from '../types'
import { get as apiGet, post, patch } from '../lib/api'

interface SopState {
  templates: SopTemplate[]
  instances: SopInstance[]
  tasks: ProjectTask[]
  loading: boolean
  error: string | null
  fetchTemplates: () => Promise<void>
  fetchInstances: () => Promise<void>
  createInstance: (data: { clientId: string; templateId: string }) => Promise<SopInstance | null>
  fetchTasks: (instanceId: string) => Promise<void>
  updateTask: (taskId: string, data: Partial<ProjectTask>) => Promise<ProjectTask | null>
}

export const useSopStore = create<SopState>((set) => ({
  templates: [],
  instances: [],
  tasks: [],
  loading: false,
  error: null,

  fetchTemplates: async () => {
    const res = await apiGet<SopTemplate[]>('/sops/templates')
    if (res.data) set({ templates: res.data })
  },

  fetchInstances: async () => {
    set({ loading: true, error: null })
    try {
      const res = await apiGet<SopInstance[]>('/sops/instances')
      if (res.data) set({ instances: res.data })
      else set({ error: res.error })
    } catch {
      set({ error: 'Failed to load instances' })
    } finally {
      set({ loading: false })
    }
  },

  createInstance: async (data) => {
    const res = await post<SopInstance>('/sops/instances', data)
    if (res.data) {
      set((state) => ({ instances: [res.data!, ...state.instances] }))
      return res.data
    }
    return null
  },

  fetchTasks: async (instanceId) => {
    const res = await apiGet<ProjectTask[]>(`/sops/tasks/${instanceId}`)
    if (res.data) set({ tasks: res.data })
  },

  updateTask: async (taskId, data) => {
    const res = await patch<ProjectTask>(`/sops/tasks/${taskId}`, data)
    if (res.data) {
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? res.data! : t)),
      }))
      return res.data
    }
    return null
  },
}))
