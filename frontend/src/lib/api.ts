import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || 'Something went wrong'
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      toast.error('Session expired. Please login again.')
    } else {
      toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
}

// Studios API
export const studiosAPI = {
  getAll: () => api.get('/studios'),
  search: (params: any) => api.get('/studios/search', { params }),
  getById: (id: string) => api.get(`/studios/${id}`),
  create: (data: any) => api.post('/studios', data),
  update: (id: string, data: any) => api.put(`/studios/${id}`, data),
  delete: (id: string) => api.delete(`/studios/${id}`),
  getMyStudios: () => api.get('/studios/my-studios'),
}

// Bookings API
export const bookingsAPI = {
  create: (data: any) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getStudioBookings: (studioId: string) => api.get(`/bookings/studio/${studioId}`),
  updateStatus: (id: string, status: string) => api.patch(`/bookings/${id}/status`, { status }),
  cancel: (id: string) => api.patch(`/bookings/${id}/cancel`),
}

// Reviews API
export const reviewsAPI = {
  create: (data: any) => api.post('/reviews', data),
  getStudioReviews: (studioId: string) => api.get(`/reviews/studio/${studioId}`),
}

// Users API
export const usersAPI = {
  updateProfile: (data: any) => api.put('/users/profile', data),
  getProfile: (id: string) => api.get(`/users/profile/${id}`),
  getStats: () => api.get('/users/stats'),
}
