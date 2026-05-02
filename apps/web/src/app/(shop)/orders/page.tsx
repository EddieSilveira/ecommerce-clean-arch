'use client'

import { useOrders } from '@/hooks/use-orders'
import { OrderCard } from '@/components/orders/OrderCard'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

export default function OrdersPage() {
  const { data, isLoading } = useOrders()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Meus pedidos</h1>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg bg-[#111]" />
          ))}
        </div>
      </div>
    )
  }

  const orders = data?.orders ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Meus pedidos</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <p className="text-muted-foreground">Você ainda não fez nenhum pedido.</p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-md bg-amber-500 hover:bg-amber-400 text-black font-semibold px-6 py-2.5 text-sm transition-colors"
          >
            Começar a comprar
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
