import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type RegisterFormData = z.infer<typeof registerSchema>

export const productSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.number().min(1, 'Price must be at least 1'),
  stock: z.number().min(0, 'Stock cannot be negative'),
})

export type ProductFormData = z.infer<typeof productSchema>

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  iconUrl: z.string().optional(),
})

export type CategoryFormData = z.infer<typeof categorySchema>

export const variantSchema = z.object({
  name: z.string().min(1, 'Variant name is required'),
  price: z.number().int().nonnegative('Price must be a non-negative number'),
  stock: z.number().int().nonnegative('Stock must be a non-negative number'),
  sku: z.string().optional().nullable(),
})

export type VariantFormData = z.infer<typeof variantSchema>

export const variantUpdateSchema = z.object({
  name: z.string().min(1, 'Variant name is required').optional(),
  price: z.number().int().nonnegative('Price must be a non-negative number').optional(),
  stock: z.number().int().nonnegative('Stock must be a non-negative number').optional(),
  sku: z.string().optional().nullable(),
})

export type VariantUpdateFormData = z.infer<typeof variantUpdateSchema>