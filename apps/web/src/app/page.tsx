import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { ProductGrid } from '@/components/products/ProductGrid'
import type { ProductsResponse } from '@/lib/types'

async function getFeaturedProducts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?limit=4`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const data: ProductsResponse = await res.json()
    return data.products
  } catch {
    return []
  }
}

export default async function HomePage() {
  const featured = await getFeaturedProducts()

  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="text-center py-20 space-y-6">
        <div className="inline-block px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs font-medium tracking-wider uppercase">
          Nova coleção
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
          Qualidade premium
          <br />
          <span className="text-muted-foreground">para você</span>
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Produtos selecionados com os mais altos padrões de qualidade.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/products"
            className={buttonVariants({ size: 'lg', className: 'bg-amber-500 hover:bg-amber-400 text-black font-semibold' })}
          >
            Ver produtos
          </Link>
          <Link
            href="/auth/sign-up"
            className={buttonVariants({ size: 'lg', variant: 'outline', className: 'border-[#2a2a2a] hover:border-white' })}
          >
            Criar conta
          </Link>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Em destaque</h2>
            <Link href="/products" className="text-sm text-muted-foreground hover:text-amber-500 transition-colors">
              Ver todos →
            </Link>
          </div>
          <ProductGrid products={featured} />
        </section>
      )}
    </div>
  )
}
