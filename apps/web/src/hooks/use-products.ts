import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Product, ProductsResponse } from '@/lib/types'

export function useProduct(id: string) {
  return useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => api.get<Product>(`/products/${id}`),
    staleTime: 60_000,
  })
}

export function useInfiniteProducts(limit = 12) {
  return useInfiniteQuery<ProductsResponse>({
    queryKey: ['products', limit],
    queryFn: ({ pageParam }) =>
      api.get<ProductsResponse>(
        `/products?limit=${limit}${pageParam ? `&cursor=${pageParam}` : ''}`,
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
    staleTime: 60_000,
  })
}
