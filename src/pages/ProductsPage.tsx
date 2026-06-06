import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit, Trash2, ImageIcon, Package, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { productService, CreateProductRequest } from '@/api/products'
import { formatCurrency } from '@/utils'
import { productSchema, ProductFormData, variantSchema, VariantFormData, variantUpdateSchema, VariantUpdateFormData } from '@/validations'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import type { ProductVariant } from '@/types'

export function ProductsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [page, setPage] = useState(1)

  const [variantDialogOpen, setVariantDialogOpen] = useState(false)
  const [variantProductId, setVariantProductId] = useState<string | null>(null)
  const [variantProductName, setVariantProductName] = useState<string>('')
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null)
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null)

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', { page, q: search }],
    queryFn: () => productService.getProducts({ page, limit: 10, q: search }),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: productService.getCategories,
  })

  const { data: variantsData, refetch: refetchVariants } = useQuery({
    queryKey: ['variants', variantProductId],
    queryFn: () => productService.getVariants(variantProductId!),
    enabled: !!variantProductId && variantDialogOpen,
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateProductRequest) => productService.createProduct(data),
    onError: () => {
      toast.error('Failed to create product')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProductRequest> }) =>
      productService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setIsOpen(false)
      setEditingId(null)
      resetProduct()
      toast.success('Product updated successfully')
    },
    onError: () => {
      toast.error('Failed to update product')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete product')
    },
  })

  const createVariantMutation = useMutation({
    mutationFn: (data: { name: string; price: number; stock: number; sku?: string | null }) =>
      productService.createVariant(variantProductId!, data),
    onSuccess: () => {
      refetchVariants()
      variantFormReset()
      toast.success('Variant created successfully')
    },
    onError: () => {
      toast.error('Failed to create variant')
    },
  })

  const updateVariantMutation = useMutation({
    mutationFn: (data: { name?: string; price?: number; stock?: number; sku?: string | null }) =>
      productService.updateVariant(variantProductId!, editingVariant!.id, data),
    onSuccess: () => {
      refetchVariants()
      setEditingVariant(null)
      variantFormReset()
      toast.success('Variant updated successfully')
    },
    onError: () => {
      toast.error('Failed to update variant')
    },
  })

  const deleteVariantMutation = useMutation({
    mutationFn: (variantId: string) => productService.deleteVariant(variantProductId!, variantId),
    onSuccess: () => {
      refetchVariants()
      toast.success('Variant deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete variant')
    },
  })

  const {
    register: registerProduct,
    handleSubmit: handleProductSubmit,
    reset: resetProduct,
    setValue: setProductValue,
    watch: watchProduct,
    formState: { errors: productErrors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      categoryId: '',
      name: '',
      description: '',
      price: 0,
      stock: 0,
    },
  })

  const {
    register: registerVariant,
    handleSubmit: handleVariantSubmit,
    reset: resetVariant,
    setValue: setVariantValue,
    formState: { errors: variantErrors },
  } = useForm<VariantFormData | VariantUpdateFormData>({
    resolver: zodResolver(editingVariant ? variantUpdateSchema : variantSchema),
    defaultValues: {
      name: '',
      price: 0,
      stock: 0,
      sku: '',
    },
  })

  const variantFormReset = () => {
    resetVariant()
  }

  const onProductSubmit = async (data: ProductFormData) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data })
      return
    }

    try {
      const createdProduct = await createMutation.mutateAsync(data)
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product created successfully')

      if (selectedImageFile) {
        try {
          await productService.uploadImage(createdProduct.id, selectedImageFile)
          queryClient.invalidateQueries({ queryKey: ['products'] })
          toast.success('Product image uploaded successfully')
        } catch {
          toast.error('Product was created, but image upload failed')
        }
      }

      setIsOpen(false)
      setSelectedImageFile(null)
      resetProduct()
    } catch {
      toast.error('Failed to create product')
    }
  }

  const onVariantSubmit = async (data: VariantFormData | VariantUpdateFormData) => {
    if (editingVariant) {
      updateVariantMutation.mutate(data as VariantUpdateFormData)
    } else {
      createVariantMutation.mutate(data as VariantFormData)
    }
  }

  const handleEditProduct = (product: NonNullable<typeof productsData>['data'][0]) => {
    setEditingId(product.id)
    setProductValue('categoryId', product.category?.id || '')
    setProductValue('name', product.name)
    setProductValue('price', product.price)
    setProductValue('stock', product.stock)
    setSelectedImageFile(null)
    setIsOpen(true)
  }

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleOpenVariantDialog = (productId: string, productName: string) => {
    setVariantProductId(productId)
    setVariantProductName(productName)
    setEditingVariant(null)
    variantFormReset()
    setVariantDialogOpen(true)
  }

  const handleCloseVariantDialog = () => {
    setVariantDialogOpen(false)
    setVariantProductId(null)
    setVariantProductName('')
    setEditingVariant(null)
    variantFormReset()
  }

  const handleEditVariant = (variant: ProductVariant) => {
    setEditingVariant(variant)
    setVariantValue('name', variant.name)
    setVariantValue('price', variant.price)
    setVariantValue('stock', variant.stock)
    setVariantValue('sku', variant.sku || '')
  }

  const handleDeleteVariant = (variantId: string) => {
    if (confirm('Are you sure you want to delete this variant?')) {
      deleteVariantMutation.mutate(variantId)
    }
  }

  const cancelVariantEdit = () => {
    setEditingVariant(null)
    variantFormReset()
  }

  const isProductSubmitting = createMutation.isPending || updateMutation.isPending
  const isVariantSubmitting = createVariantMutation.isPending || updateVariantMutation.isPending

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500">Manage your product inventory</p>
        </div>
        <Button onClick={() => setIsOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search products..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsData?.data.map((product) => (
                  <>
                    <TableRow key={product.id}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                        >
                          {expandedProduct === product.id ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category?.name || '-'}</TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={product.stock < 5 ? 'destructive' : 'secondary'}
                        >
                          {product.stock}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.stock > 0 ? 'success' : 'destructive'}>
                          {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenVariantDialog(product.id, product.name)}
                            title="Manage Variants"
                          >
                            <Package className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedProduct === product.id && (
                      <TableRow key={`${product.id}-expanded`}>
                        <TableCell colSpan={8} className="bg-gray-50 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Variants</span>
                            <Button size="sm" onClick={() => handleOpenVariantDialog(product.id, product.name)}>
                              <Plus className="mr-1 h-3 w-3" />
                              Add Variant
                            </Button>
                          </div>
                          <p className="text-sm text-gray-500">Click the Package icon above to manage variants for this product.</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {productsData?.data.length || 0} of {productsData?.meta.total || 0} products
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!productsData || page >= productsData.meta.total / 10}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) {
          setEditingId(null)
          setSelectedImageFile(null)
          resetProduct()
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProductSubmit(onProductSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={watchProduct('categoryId')}
                onValueChange={(value) => setProductValue('categoryId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {productErrors.categoryId && (
                <p className="text-sm text-red-600">{productErrors.categoryId.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input {...registerProduct('name')} />
              {productErrors.name && (
                <p className="text-sm text-red-600">{productErrors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea {...registerProduct('description')} />
            </div>
            {!editingId && (
              <div className="space-y-2">
                <Label>Product Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setSelectedImageFile(event.target.files?.[0] ?? null)}
                />
                <p className="text-xs text-gray-500">
                  Optional. If omitted, the product will be created without an image.
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price</Label>
                <Input
                  type="number"
                  {...registerProduct('price', { valueAsNumber: true })}
                />
                {productErrors.price && (
                  <p className="text-sm text-red-600">{productErrors.price.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input
                  type="number"
                  {...registerProduct('stock', { valueAsNumber: true })}
                />
                {productErrors.stock && (
                  <p className="text-sm text-red-600">{productErrors.stock.message}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isProductSubmitting}>
                {isProductSubmitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={variantDialogOpen} onOpenChange={(open) => {
        if (!open) handleCloseVariantDialog()
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Variants - {variantProductName}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium mb-3">
                {editingVariant ? 'Edit Variant' : 'Add New Variant'}
              </h3>
              <form onSubmit={handleVariantSubmit(onVariantSubmit)} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Name</Label>
                    <Input
                      placeholder="e.g., Small, Red, XL"
                      {...registerVariant('name')}
                    />
                    {variantErrors.name && (
                      <p className="text-xs text-red-600">{variantErrors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label>SKU</Label>
                    <Input
                      placeholder="Optional SKU"
                      {...registerVariant('sku')}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Price</Label>
                    <Input
                      type="number"
                      {...registerVariant('price', { valueAsNumber: true })}
                    />
                    {variantErrors.price && (
                      <p className="text-xs text-red-600">{variantErrors.price.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label>Stock</Label>
                    <Input
                      type="number"
                      {...registerVariant('stock', { valueAsNumber: true })}
                    />
                    {variantErrors.stock && (
                      <p className="text-xs text-red-600">{variantErrors.stock.message}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={isVariantSubmitting}>
                    {isVariantSubmitting ? 'Saving...' : editingVariant ? 'Update Variant' : 'Add Variant'}
                  </Button>
                  {editingVariant && (
                    <Button type="button" variant="outline" size="sm" onClick={cancelVariantEdit}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Existing Variants ({variantsData?.length || 0})</h3>
              {variantsData && variantsData.length > 0 ? (
                <div className="space-y-2">
                  {variantsData.map((variant) => (
                    <div key={variant.id} className="flex items-center justify-between border rounded-lg p-3">
                      <div className="flex-1 grid grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Name:</span>
                          <span className="ml-1 font-medium">{variant.name}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">SKU:</span>
                          <span className="ml-1">{variant.sku || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Price:</span>
                          <span className="ml-1">{formatCurrency(variant.price)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Stock:</span>
                          <Badge
                            className="ml-1"
                            variant={variant.stock < 5 ? 'destructive' : 'secondary'}
                          >
                            {variant.stock}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditVariant(variant)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteVariant(variant.id)}
                        >
                          <Trash2 className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No variants yet. Add one using the form above.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseVariantDialog}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}