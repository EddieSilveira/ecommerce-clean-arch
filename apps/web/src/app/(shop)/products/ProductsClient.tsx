'use client'

import { useInfiniteProducts } from '@/hooks/use-products'
import { ProductGrid, ProductGridSkeleton } from '@/components/products/ProductGrid'
import { Button } from '@/components/ui/button'

export function ProductsClientPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteProducts(12)

  if (isLoading) return <ProductGridSkeleton count={12} />

  const products = data?.pages.flatMap((p) => p.products) ?? []

  return (
    <div className="space-y-8">
      <ProductGrid products={products} />

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="border-[#2a2a2a] hover:border-amber-500"
          >
            {isFetchingNextPage ? 'Carregando…' : 'Carregar mais'}
          </Button>
        </div>
      )}
    </div>
  )
}
