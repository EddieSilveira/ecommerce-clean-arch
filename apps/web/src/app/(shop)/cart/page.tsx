'use client'

import Link from 'next/link'
import { Trash2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCart, useCartTotal } from '@/store/cart'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'

const formatPrice = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function CartPage() {
  const { items, remove, updateQty } = useCart()
  const total = useCartTotal()
  const router = useRouter()

  const handleCheckout = () => {
    if (!isAuthenticated()) {
      router.push('/auth/sign-in?redirect=/checkout')
    } else {
      router.push('/checkout')
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <ShoppingBag size={48} strokeWidth={1} className="mx-auto text-muted-foreground" />
        <h1 className="text-2xl font-bold">Carrinho vazio</h1>
        <p className="text-muted-foreground">Adicione produtos para continuar</p>
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-md bg-amber-500 hover:bg-amber-400 text-black font-semibold px-6 py-2.5 text-sm transition-colors"
        >
          Ver produtos
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Carrinho</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 p-4 rounded-lg border border-[#2a2a2a] bg-[#111]">
            <div className="w-14 h-14 rounded bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
              IMG
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.name}</p>
              <p className="text-sm text-amber-500">{formatPrice(item.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="w-7 h-7 rounded border border-[#2a2a2a] flex items-center justify-center hover:border-white text-sm">−</button>
              <span className="w-6 text-center text-sm">{item.quantity}</span>
              <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="w-7 h-7 rounded border border-[#2a2a2a] flex items-center justify-center hover:border-white text-sm">+</button>
            </div>
            <button onClick={() => remove(item.productId)} className="text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <Separator className="bg-[#2a2a2a]" />

      <div className="flex items-center justify-between text-lg font-semibold">
        <span>Total</span>
        <span className="text-amber-500">{formatPrice(total)}</span>
      </div>

      <Button onClick={handleCheckout} size="lg" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold">
        Finalizar compra
      </Button>
    </div>
  )
}
