import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { Order, OrdersResponse } from '@/lib/types'

export function useOrders() {
  return useQuery<OrdersResponse>({
    queryKey: ['orders'],
    queryFn: () => api.get<OrdersResponse>('/orders'),
    staleTime: 0,
  })
}

export function useOrder(id: string) {
  return useQuery<Order>({
    queryKey: ['order', id],
    queryFn: () => api.get<Order>(`/orders/${id}`),
    staleTime: 0,
  })
}

export function usePlaceOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { items: { productId: string; quantity: number }[] }) =>
      api.post<Order>('/orders', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useCancelOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/orders/${id}`),
    onSuccess: (_, id) => {
      toast.success('Pedido cancelado')
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['order', id] })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}
