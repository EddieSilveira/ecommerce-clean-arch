'use client'

import { use } from 'react'
import { useOrder, useCancelOrder } from '@/hooks/use-orders'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import Link from 'next/link'

const formatPrice = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: order, isLoading } = useOrder(id)
  const { mutate: cancel, isPending: cancelling } = useCancelOrder()

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48 bg-[#111]" />
        <Skeleton className="h-40 rounded-lg bg-[#111]" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Pedido não encontrado.</p>
        <Link href="/orders" className="text-sm text-amber-500 hover:underline mt-2 block">
          Ver meus pedidos
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pedido</h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">{order.id}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="rounded-lg border border-[#2a2a2a] bg-[#111] divide-y divide-[#2a2a2a]">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between items-center px-4 py-3">
            <div>
              <p className="text-sm font-medium">{item.productName}</p>
              <p className="text-xs text-muted-foreground">
                {formatPrice(item.unitPrice)} × {item.quantity}
              </p>
            </div>
            <span className="text-sm text-amber-500">{formatPrice(item.subtotal)}</span>
          </div>
        ))}
      </div>

      <Separator className="bg-[#2a2a2a]" />

      <div className="flex justify-between text-lg font-semibold">
        <span>Total</span>
        <span className="text-amber-500">{formatPrice(order.total)}</span>
      </div>

      <div className="flex gap-3">
        <Link
          href="/orders"
          className="inline-flex items-center justify-center rounded-md border border-[#2a2a2a] hover:border-white px-4 py-2 text-sm transition-colors"
        >
          ← Meus pedidos
        </Link>

        {order.status === 'PENDING' && (
          <AlertDialog>
            <AlertDialogTrigger render={<Button variant="destructive" disabled={cancelling} />}>
              Cancelar pedido
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#1a1a1a] border-[#2a2a2a]">
              <AlertDialogHeader>
                <AlertDialogTitle>Cancelar pedido?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. O estoque dos produtos será restaurado.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-[#2a2a2a]">Voltar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => cancel(order.id)}
                  className="bg-destructive hover:bg-destructive/80"
                >
                  Confirmar cancelamento
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  )
}
