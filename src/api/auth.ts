import api from './axios'
import { AuthResponse } from '@/types'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  address?: string | null
  photo_profile?: string | null
}

export const authService = {
  login: async (data: LoginRequest) => {
    const response = await api.post<AuthResponse>('/users/login', data)
    return response.data
  },

  register: async (data: RegisterRequest) => {
    const response = await api.post<AuthResponse>('/users/register', data)
    return response.data
  },

  logout: () => {
    localStorage.removeItem('admin_token')
  },

  getToken: () => localStorage.getItem('admin_token'),

  isAuthenticated: () => !!localStorage.getItem('admin_token'),
}