import api from './axios'
import { PaginatedOrders, AdminOrderDetail, OrderStatus } from '@/types'

export interface OrderParams {
  page?: number
  limit?: number
  status?: OrderStatus
}

export const orderService = {
  getOrders: async (params?: OrderParams) => {
    const response = await api.get<PaginatedOrders>('/admin/orders', { params })
    return response.data
  },

  getOrder: async (id: string) => {
    const response = await api.get<{ data: AdminOrderDetail }>(`/admin/orders/${id}`)
    return response.data.data
  },

  updateOrderStatus: async (id: string, status: OrderStatus) => {
    const response = await api.put<{ data: { id: string; status: OrderStatus } }>(
      `/admin/orders/${id}/status`,
      { status }
    )
    return response.data.data
  },
}