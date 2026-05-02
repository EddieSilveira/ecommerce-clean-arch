'use client'

import { useState } from 'react'
import { Package, ShoppingCart, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/store/cart'
import { toast } from 'sonner'
import type { Product } from '@/lib/types'

type Props = { product: Product }

const formatPrice = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v / 100)

export function ProductDetail({ product }: Props) {
  const [qty, setQty] = useState(1)
  const { add } = useCart()
  const outOfStock = product.stock === 0

  const handleAdd = () => {
    add({ productId: product.id, name: product.name, price: product.price, quantity: qty })
    toast.success(`${qty}x ${product.name} adicionado ao carrinho`)
  }

  return (
    <div className="grid md:grid-cols-2 gap-10">
      <div className="aspect-square rounded-lg bg-[#111] border border-[#2a2a2a] flex items-center justify-center">
        <Package size={80} strokeWidth={1} className="text-muted-foreground" />
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="text-2xl font-semibold text-amber-500 mt-2">{formatPrice(product.price)}</p>
        </div>

        <Separator className="bg-[#2a2a2a]" />

        <div className="flex items-center gap-3">
          {outOfStock ? (
            <Badge variant="secondary">Esgotado</Badge>
          ) : (
            <Badge variant="outline" className="border-[#2a2a2a] text-muted-foreground">
              {product.stock} em estoque
            </Badge>
          )}
        </div>

        {!outOfStock && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Quantidade</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-8 h-8 rounded border border-[#2a2a2a] flex items-center justify-center hover:border-white transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-medium">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="w-8 h-8 rounded border border-[#2a2a2a] flex items-center justify-center hover:border-white transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <Button
              onClick={handleAdd}
              size="lg"
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold"
            >
              <ShoppingCart size={18} className="mr-2" />
              Adicionar ao carrinho
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
