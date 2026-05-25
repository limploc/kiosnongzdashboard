import api from './axios'
import { AdminDashboardData } from '@/types'

export const dashboardService = {
  getStats: async () => {
    const response = await api.get<{ data: AdminDashboardData }>('/admin/dashboard')
    return response.data.data
  },
}