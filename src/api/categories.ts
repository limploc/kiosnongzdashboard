import api from './axios'
import { Category } from '@/types'

const DEFAULT_CATEGORY_ICON_URL = 'https://api.iconify.design/mdi:folder.svg'

export interface CategoryRequest {
  name: string
  iconUrl?: string
}

function normalizeCategoryRequest(data: CategoryRequest) {
  const iconUrl = data.iconUrl ?? ''
  const finalIconUrl =
    iconUrl && iconUrl.trim() !== ''
      ? iconUrl
      : DEFAULT_CATEGORY_ICON_URL

  console.log({ name: data.name, iconUrl, finalIconUrl })

  return {
    name: data.name,
    iconUrl: finalIconUrl,
  }
}

export const categoryService = {
  getCategories: async () => {
    const response = await api.get<{ data: Category[] }>('/admin/categories')
    return response.data.data
  },

  createCategory: async (data: CategoryRequest) => {
    const response = await api.post<{ data: Category }>(
      '/admin/categories',
      normalizeCategoryRequest(data),
    )
    return response.data.data
  },

  updateCategory: async (id: string, data: CategoryRequest) => {
    const response = await api.patch<{ data: Category }>(
      `/admin/categories/${id}`,
      normalizeCategoryRequest(data),
    )
    return response.data.data
  },

  deleteCategory: async (id: string) => {
    const response = await api.delete<{ data: Category }>(`/admin/categories/${id}`)
    return response.data.data
  },
}