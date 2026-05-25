import api from './axios'
import { Category } from '@/types'

export interface CategoryRequest {
  name: string
  iconUrl?: string
}

export const categoryService = {
  getCategories: async () => {
    const response = await api.get<{ data: Category[] }>('/admin/categories')
    return response.data.data
  },

  createCategory: async (data: CategoryRequest) => {
    const response = await api.post<{ data: Category }>('/admin/categories', data)
    return response.data.data
  },

  updateCategory: async (id: string, data: CategoryRequest) => {
    const response = await api.patch<{ data: Category }>(`/admin/categories/${id}`, data)
    return response.data.data
  },

  deleteCategory: async (id: string) => {
    const response = await api.delete<{ data: Category }>(`/admin/categories/${id}`)
    return response.data.data
  },
}