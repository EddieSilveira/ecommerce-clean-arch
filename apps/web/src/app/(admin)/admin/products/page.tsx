'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { api } from '@/lib/api'
import type { Product, ProductsResponse } from '@/lib/types'

const schema = z.object({
  name: z.string().min(1, 'Informe o nome'),
  price: z.string().transform((v) => Number(v)),
  stock: z.string().transform((v) => Math.trunc(Number(v))),
})

type FormInput = { name: string; price: string; stock: string }
type FormData = { name: string; price: number; stock: number }

const formatPrice = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v / 100)

export default function AdminProductsPage() {
  const qc = useQueryClient()
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const { data } = useQuery<ProductsResponse>({
    queryKey: ['admin-products'],
    queryFn: () => api.get<ProductsResponse>('/products?limit=100'),
    staleTime: 0,
  })

  const products = data?.products ?? []

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInput, unknown, FormData>({
    resolver: zodResolver(schema),
  })

  const createMutation = useMutation({
    mutationFn: (d: FormData) => api.post<Product>('/products', d),
    onSuccess: () => {
      toast.success('Produto criado')
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      setFormOpen(false)
      reset()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }: FormData & { id: string }) => api.put<Product>(`/products/${id}`, d),
    onSuccess: () => {
      toast.success('Produto atualizado')
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      setFormOpen(false)
      setEditingProduct(null)
      reset()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      toast.success('Produto removido')
      qc.invalidateQueries({ queryKey: ['admin-products'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const openCreate = () => {
    setEditingProduct(null)
    reset({ name: '', price: '0', stock: '0' })
    setFormOpen(true)
  }

  const openEdit = (p: Product) => {
    setEditingProduct(p)
    reset({ name: p.name, price: String(p.price), stock: String(p.stock) })
    setFormOpen(true)
  }

  const onSubmit = (d: FormData) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, ...d })
    } else {
      createMutation.mutate(d)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
        <Button
          onClick={openCreate}
          className="bg-amber-500 hover:bg-amber-400 text-black font-semibold"
        >
          <Plus size={16} className="mr-2" /> Novo produto
        </Button>
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a]">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Editar produto' : 'Novo produto'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input placeholder="Nome do produto" {...register('name')} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço (centavos)</Label>
                  <Input type="number" placeholder="9990" {...register('price')} />
                  {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Estoque</Label>
                  <Input type="number" placeholder="100" {...register('stock')} />
                  {errors.stock && <p className="text-xs text-destructive">{errors.stock.message}</p>}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isPending} className="flex-1">
                  {isPending ? 'Salvando…' : editingProduct ? 'Salvar' : 'Criar'}
                </Button>
                <Button type="button" variant="outline" className="border-[#2a2a2a]" onClick={() => setFormOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border border-[#2a2a2a] bg-[#111] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[#2a2a2a] hover:bg-transparent">
              <TableHead>Nome</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id} className="border-[#2a2a2a] hover:bg-[#1a1a1a]">
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-amber-500">{formatPrice(p.price)}</TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(p)}>
                      <Pencil size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate(p.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
