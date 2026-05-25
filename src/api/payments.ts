import api from './axios'
import { PaginatedPayments, AdminPaymentDetail, PaymentStatus } from '@/types'

export interface PaymentParams {
  page?: number
  limit?: number
  status?: PaymentStatus
}

export const paymentService = {
  getPayments: async (params?: PaymentParams) => {
    const response = await api.get<PaginatedPayments>('/admin/payments', { params })
    return response.data
  },

  getPayment: async (id: string) => {
    const response = await api.get<{ data: AdminPaymentDetail }>(`/admin/payments/${id}`)
    return response.data.data
  },

  approvePayment: async (id: string) => {
    const response = await api.put<{ data: { id: string; status: PaymentStatus } }>(
      `/admin/payments/${id}/approve`
    )
    return response.data.data
  },

  rejectPayment: async (id: string) => {
    const response = await api.put<{ data: { id: string; status: PaymentStatus } }>(
      `/admin/payments/${id}/reject`
    )
    return response.data.data
  },
}