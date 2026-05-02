import Link from 'next/link'
import { Package } from 'lucide-react'
import { OrderStatusBadge } from './OrderStatusBadge'
import type { OrderSummary } from '@/lib/types'

const formatPrice = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v / 100)

export function OrderCard({ order }: { order: OrderSummary }) {
  return (
    <Link href={`/orders/${order.id}`}>
      <div className="flex items-center justify-between p-4 rounded-lg border border-[#2a2a2a] bg-[#111] hover:border-amber-500/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
            <Package size={16} className="text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium font-mono">{order.id.slice(0, 8)}…</p>
            <p className="text-xs text-muted-foreground">{formatPrice(order.total)}</p>
          </div>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
    </Link>
  )
}
