import api from './axios'
import { ProductDetail, PaginatedProducts, Category, ProductVariant } from '@/types'

export interface ProductParams {
  page?: number
  limit?: number
  q?: string
  categoryId?: string
  sort?: string
  order?: 'asc' | 'desc'
}

export interface CreateProductRequest {
  categoryId: string
  name: string
  description?: string
  price: number
  stock: number
}

export interface UpdateProductRequest {
  categoryId?: string
  name?: string
  description?: string
  price?: number
  stock?: number
}

export const productService = {
  getProducts: async (params?: ProductParams) => {
    const response = await api.get<PaginatedProducts>('/admin/products', { params })
    return response.data
  },

  getProduct: async (id: string) => {
    const response = await api.get<{ data: ProductDetail }>(`/admin/products/${id}`)
    return response.data.data
  },

  createProduct: async (data: CreateProductRequest) => {
    const response = await api.post<{ data: ProductDetail }>('/admin/products', data)
    return response.data.data
  },

  updateProduct: async (id: string, data: UpdateProductRequest) => {
    const response = await api.patch<{ data: ProductDetail }>(`/admin/products/${id}`, data)
    return response.data.data
  },

  deleteProduct: async (id: string) => {
    const response = await api.delete<{ data: ProductDetail }>(`/admin/products/${id}`)
    return response.data.data
  },

  uploadImage: async (id: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post<{ data: { id: string; url: string; isPrimary: boolean } }>(
      `/admin/products/${id}/images/upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return response.data.data
  },

  deleteImage: async (productId: string, imageId: string) => {
    const response = await api.delete(`/admin/products/${productId}/images/${imageId}`)
    return response.data
  },

  getCategories: async () => {
    const response = await api.get<{ data: Category[] }>('/admin/categories')
    return response.data.data
  },

  getVariants: async (productId: string) => {
    const response = await api.get<{ data: ProductVariant[] }>(`/admin/products/${productId}/variants`)
    return response.data.data
  },

  createVariant: async (productId: string, data: { name: string; price: number; stock: number; sku?: string | null }) => {
    const response = await api.post<{ data: ProductVariant }>(`/admin/products/${productId}/variants`, data)
    return response.data.data
  },

  updateVariant: async (productId: string, variantId: string, data: { name?: string; price?: number; stock?: number; sku?: string | null }) => {
    const response = await api.patch<{ data: ProductVariant }>(`/admin/products/${productId}/variants/${variantId}`, data)
    return response.data.data
  },

  deleteVariant: async (productId: string, variantId: string) => {
    const response = await api.delete<{ data: { id: string } }>(`/admin/products/${productId}/variants/${variantId}`)
    return response.data.data
  },
}