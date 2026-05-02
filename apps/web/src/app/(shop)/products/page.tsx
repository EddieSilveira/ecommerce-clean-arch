import { Suspense } from 'react'
import { ProductsClientPage } from './ProductsClient'
import { ProductGridSkeleton } from '@/components/products/ProductGrid'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Produtos — Store' }

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
        <p className="text-muted-foreground mt-1">Explore nosso catálogo</p>
      </div>
      <Suspense fallback={<ProductGridSkeleton count={12} />}>
        <ProductsClientPage />
      </Suspense>
    </div>
  )
}
