import { create } from 'zustand'
import api from '../api/axios'

const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),

  logout: () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    set({ user: null })
  },

  fetchMe: async () => {
    const token = localStorage.getItem('access')
    if (!token) { set({ loading: false }); return }
    try {
      const { data } = await api.get('auth/me/')
      set({ user: data, loading: false })
    } catch {
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      set({ user: null, loading: false })
    }
  },
}))

export default useAuthStore
