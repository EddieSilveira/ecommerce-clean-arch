'use client'

import { useRouter } from 'next/navigation'
import { useCart, useCartTotal } from '@/store/cart'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import type { Order } from '@/lib/types'

const formatPrice = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function CheckoutPage() {
  const { items, clear } = useCart()
  const total = useCartTotal()
  const router = useRouter()

  const { mutate: placeOrder, isPending } = useMutation({
    mutationFn: (data: { items: { productId: string; quantity: number }[] }) =>
      api.post<Order>('/orders', data),
    onSuccess: (order) => {
      clear()
      router.push(`/orders/${order.id}`)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (items.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-muted-foreground">Nenhum item no carrinho.</p>
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-md border border-[#2a2a2a] hover:border-white px-4 py-2 text-sm transition-colors"
        >
          Continuar comprando
        </Link>
      </div>
    )
  }

  const handleConfirm = () => {
    placeOrder({
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    })
  }

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Confirmação do pedido</h1>

      <div className="rounded-lg border border-[#2a2a2a] bg-[#111] divide-y divide-[#2a2a2a]">
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between items-center px-4 py-3 text-sm">
            <span>{item.name} <span className="text-muted-foreground">×{item.quantity}</span></span>
            <span className="text-amber-500">{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <Separator className="bg-[#2a2a2a]" />

      <div className="flex justify-between text-lg font-semibold">
        <span>Total</span>
        <span className="text-amber-500">{formatPrice(total)}</span>
      </div>

      <Button
        onClick={handleConfirm}
        size="lg"
        className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold"
        disabled={isPending}
      >
        {isPending ? 'Processando…' : 'Confirmar pedido'}
      </Button>

      <div className="text-center">
        <Link href="/cart" className="text-sm text-muted-foreground hover:text-white transition-colors">
          ← Voltar ao carrinho
        </Link>
      </div>
    </div>
  )
}
