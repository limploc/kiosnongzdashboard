export interface User {
  id: string
  name: string
  email: string
  address?: string | null
  photo_profile?: string | null
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  success: boolean
  message: string
  token: string
  data: User
}

export interface Category {
  id: string
  name: string
  iconUrl?: string | null
}

export interface Product {
  id: string
  name: string
  price: number
  stock: number
  image?: string | null
  category?: Category
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
}

export interface PaginatedProducts {
  data: Product[]
  meta: PaginationMeta
}

export interface AdminDashboardData {
  totalSales: number
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  lowStockProducts: Product[]
  totalProducts: number
  totalCustomers: number
}

export interface AdminOrderListItem {
  id: string
  status: OrderStatus
  total: number
  paymentStatus: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

export interface AdminOrderDetail {
  id: string
  status: OrderStatus
  subtotal: number
  shipping: number
  total: number
  payment: {
    method: string
    status: PaymentStatus
    amount: number
    proofImage?: string | null
    paidAt?: string | null
  }
  shipment?: {
    courier: string
    trackingNumber: string
    status: string
  } | null
  customer: {
    id: string
    name: string
    email: string
  }
  address: Address
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  name: string
  qty: number
  price: number
}

export interface Address {
  id: string
  label: string
  recipientName: string
  phone: string
  addressLine: string
  city: string
  province: string
  postalCode: string
  isDefault: boolean
}

export interface PaginatedOrders {
  data: AdminOrderListItem[]
  meta: PaginationMeta
}

export interface AdminPaymentListItem {
  id: string
  orderId: string
  method: string
  status: PaymentStatus
  amount?: number
  proofImage?: string | null
  paidAt?: string | null
  createdAt: string
  orderStatus: string
  customer: {
    id: string
    name: string
    email: string
  }
}

export interface AdminPaymentDetail {
  id: string
  orderId: string
  method: string
  status: PaymentStatus
  proofImage?: string | null
  paidAt?: string | null
  createdAt: string
  order: {
    status: OrderStatus
    total: number
    paymentStatus: string
  }
  customer: {
    id: string
    name: string
    email: string
  }
  address: Address
  items: OrderItem[]
}

export interface PaginatedPayments {
  data: AdminPaymentListItem[]
  meta: PaginationMeta
}

export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED'
export type PaymentStatus = 'PENDING' | 'PAID' | 'REJECTED' | 'EXPIRED'

export interface Customer {
  id: string
  name: string
  email: string
  address?: string | null
  photo_profile?: string | null
  created_at: string
  orderCount?: number
}

export interface ProductVariant {
  id: string
  productId: string
  name: string
  price: number
  stock: number
  sku?: string | null
  createdAt: string
  updatedAt: string
}

export interface ProductDetail extends Product {
  description?: string | null
  images: string[]
  category: Category
  variants: ProductVariant[]
}