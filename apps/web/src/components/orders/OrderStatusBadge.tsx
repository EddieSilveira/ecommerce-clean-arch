import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Status = 'PENDING' | 'CONFIRMED' | 'CANCELLED'

const labels: Record<Status, string> = {
  PENDING: 'Aguardando',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
}

const styles: Record<Status, string> = {
  PENDING: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  CONFIRMED: 'bg-green-500/10 text-green-500 border-green-500/30',
  CANCELLED: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
}

export function OrderStatusBadge({ status }: { status: Status }) {
  return (
    <Badge variant="outline" className={cn('text-xs font-medium', styles[status])}>
      {labels[status]}
    </Badge>
  )
}
