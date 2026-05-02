'use client'

import Link from 'next/link'
import { ShoppingCart, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCart } from '@/store/cart'
import { toast } from 'sonner'
import type { Product } from '@/lib/types'
import { cn } from '@/lib/utils'

type Props = { product: Product }

const formatPrice = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export function ProductCard({ product }: Props) {
  const { add } = useCart()
  const outOfStock = product.stock === 0

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    add({ productId: product.id, name: product.name, price: product.price, quantity: 1 })
    toast.success(`${product.name} adicionado ao carrinho`)
  }

  return (
    <Link href={`/products/${product.id}`}>
      <div className={cn(
        'group relative rounded-lg border border-[#2a2a2a] bg-[#111] p-4 flex flex-col gap-4',
        'hover:border-amber-500/50 transition-all duration-200',
        outOfStock && 'opacity-60',
      )}>
        <div className="aspect-square rounded bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
          <Package size={40} strokeWidth={1} className="text-muted-foreground" />
        </div>

        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium line-clamp-2">{product.name}</p>
          <p className="text-base font-semibold text-amber-500">{formatPrice(product.price)}</p>
        </div>

        <div className="flex items-center justify-between gap-2">
          {outOfStock ? (
            <Badge variant="secondary" className="text-xs">Esgotado</Badge>
          ) : (
            <Badge variant="outline" className="text-xs border-[#2a2a2a] text-muted-foreground">
              {product.stock} em estoque
            </Badge>
          )}
          <Button
            size="sm"
            variant="outline"
            disabled={outOfStock}
            onClick={handleAdd}
            className="border-[#2a2a2a] hover:border-amber-500 hover:text-amber-500 transition-colors"
          >
            <ShoppingCart size={14} />
          </Button>
        </div>
      </div>
    </Link>
  )
}
