import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Eye, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { paymentService, PaymentParams } from '@/api/payments'
import { formatCurrency, formatDateTime } from '@/utils'
import { PaymentStatus } from '@/types'
import { toast } from 'sonner'

const paymentStatusColors: Record<PaymentStatus, string> = {
  PENDING: 'warning',
  PAID: 'success',
  REJECTED: 'destructive',
  EXPIRED: 'secondary',
}

export function PaymentsPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const params: PaymentParams = {
    page,
    limit: 10,
    ...(statusFilter && { status: statusFilter as PaymentStatus }),
  }

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['payments', params],
    queryFn: () => paymentService.getPayments(params),
  })

  const { data: paymentDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['payment', selectedPayment],
    queryFn: () => paymentService.getPayment(selectedPayment!),
    enabled: !!selectedPayment,
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => paymentService.approvePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['payment', selectedPayment] })
      toast.success('Payment approved')
    },
    onError: () => {
      toast.error('Failed to approve payment')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => paymentService.rejectPayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['payment', selectedPayment] })
      toast.success('Payment rejected')
    },
    onError: () => {
      toast.error('Failed to reject payment')
    },
  })

  const handleViewDetail = (id: string) => {
    setSelectedPayment(id)
    setIsDetailOpen(true)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-500">Verify and manage customer payments</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
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
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentsData?.data.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">#{payment.id}</TableCell>
                    <TableCell>#{payment.orderId}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.customer.name}</p>
                        <p className="text-sm text-gray-500">{payment.customer.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="uppercase">{payment.method}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(payment.amount || 0)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={paymentStatusColors[payment.status] as 'default'}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {formatDateTime(payment.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetail(payment.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {paymentsData?.data.length || 0} of {paymentsData?.meta.total || 0} payments
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
                disabled={!paymentsData || page >= paymentsData.meta.total / 10}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Details #{selectedPayment}</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : paymentDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Customer</h4>
                  <p className="font-medium">{paymentDetail.customer.name}</p>
                  <p className="text-sm text-gray-500">{paymentDetail.customer.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Order ID</h4>
                  <p className="font-medium">#{paymentDetail.orderId}</p>
                </div>
              </div>

              {paymentDetail.proofImage && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Payment Proof</h4>
                  <img
                    src={paymentDetail.proofImage}
                    alt="Payment proof"
                    className="max-h-64 rounded-lg border object-contain"
                  />
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Order Items</h4>
                <div className="border rounded-lg">
                  {paymentDetail.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border-b last:border-b-0"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                      </div>
                      <p className="font-medium">{formatCurrency(item.price * item.qty)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex gap-2">
                  {paymentDetail.status === 'PENDING' && (
                    <>
                      <Button
                        onClick={() => approveMutation.mutate(paymentDetail.id)}
                        disabled={approveMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => rejectMutation.mutate(paymentDetail.id)}
                        disabled={rejectMutation.isPending}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(paymentDetail.order?.total || 0)}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}