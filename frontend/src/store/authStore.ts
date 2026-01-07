import { create } from 'zustand'
import { authAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  fullName: string
  role: 'CREATOR' | 'STUDIO_OWNER' | 'ADMIN'
  phone?: string
  profileImage?: string
  bio?: string
  createdAt: string
  accountHolderName?: string
  accountNumber?: string
  ifscCode?: string
  bankName?: string
  upiId?: string
  razorpayAccountId?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: any | FormData) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,

  login: async (email, password) => {
    try {
      set({ isLoading: true })
      const response = await authAPI.login({ email, password })
      const { token, user } = response.data

      localStorage.setItem('token', token)
      set({ user, token, isAuthenticated: true, isLoading: false })
      toast.success('Login successful!')
    } catch (error: any) {
      set({ isLoading: false })
      throw error
    }
  },

  register: async (data) => {
    try {
      set({ isLoading: true })
      const response = await authAPI.register(data)
      const { token, user } = response.data

      localStorage.setItem('token', token)
      set({ user, token, isAuthenticated: true, isLoading: false })
      toast.success('Registration successful!')
    } catch (error: any) {
      set({ isLoading: false })
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null, isAuthenticated: false })
    toast.success('Logged out successfully')
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      set({ isAuthenticated: false, user: null })
      return
    }

    try {
      const response = await authAPI.getMe()
      set({ user: response.data.user, isAuthenticated: true })
    } catch (error) {
      localStorage.removeItem('token')
      set({ user: null, token: null, isAuthenticated: false })
    }
  },

  setUser: (user) => {
    set({ user })
  },
}))
