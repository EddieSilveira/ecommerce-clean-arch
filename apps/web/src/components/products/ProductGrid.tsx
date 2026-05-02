import { ProductCard } from './ProductCard'
import { Skeleton } from '@/components/ui/skeleton'
import type { Product } from '@/lib/types'

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-[#2a2a2a] bg-[#111] p-4 space-y-4">
          <Skeleton className="aspect-square rounded bg-[#1a1a1a]" />
          <Skeleton className="h-4 w-3/4 bg-[#1a1a1a]" />
          <Skeleton className="h-4 w-1/2 bg-[#1a1a1a]" />
        </div>
      ))}
    </div>
  )
}
