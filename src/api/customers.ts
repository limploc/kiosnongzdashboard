import api from './axios'
import { Customer, PaginationMeta } from '@/types'

export interface CustomerParams {
  page?: number
  limit?: number
  q?: string
}

interface PaginatedCustomers {
  data: Customer[]
  meta: PaginationMeta
}

export const customerService = {
  getCustomers: async (params?: CustomerParams) => {
    try {
      const response = await api.get<PaginatedCustomers>('/users', { params })
      return response.data
    } catch {
      return { data: [], meta: { page: 1, limit: 10, total: 0 } }
    }
  },

  getCustomer: async (id: string) => {
    try {
      const response = await api.get<{ data: Customer }>(`/users/${id}`)
      return response.data.data
    } catch {
      return null
    }
  },
}