import api from './axios'
import { AuthResponse } from '@/types'

export interface LoginRequest {
  email: string
  password: string
}

export const authService = {
  login: async (data: LoginRequest) => {
    const response = await api.post<AuthResponse>('/users/login', data)
    return response.data
  },

  logout: () => {
    localStorage.removeItem('admin_token')
  },

  getToken: () => localStorage.getItem('admin_token'),

  isAuthenticated: () => !!localStorage.getItem('admin_token'),
}