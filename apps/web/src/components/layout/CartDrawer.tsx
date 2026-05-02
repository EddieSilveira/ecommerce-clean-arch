'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart, useCartTotal } from '@/store/cart'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'

type Props = {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: Props) {
  const { items, remove, updateQty } = useCart()
  const total = useCartTotal()
  const router = useRouter()

  const handleCheckout = () => {
    onClose()
    if (!isAuthenticated()) {
      router.push('/auth/sign-in?redirect=/checkout')
    } else {
      router.push('/checkout')
    }
  }

  const formatPrice = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="bg-[#111] border-[#2a2a2a] flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag size={18} /> Carrinho
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <ShoppingBag size={40} strokeWidth={1} />
            <p className="text-sm">Seu carrinho está vazio</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3 items-start">
                  <div className="w-12 h-12 rounded bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
                    IMG
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-sm text-amber-500">{formatPrice(item.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQty(item.productId, item.quantity - 1)}
                        className="w-6 h-6 rounded border border-[#2a2a2a] flex items-center justify-center hover:border-white transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.productId, item.quantity + 1)}
                        className="w-6 h-6 rounded border border-[#2a2a2a] flex items-center justify-center hover:border-white transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => remove(item.productId)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-4">
              <Separator className="bg-[#2a2a2a]" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold text-amber-500">{formatPrice(total)}</span>
              </div>
              <Button onClick={handleCheckout} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold">
                Finalizar compra
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
