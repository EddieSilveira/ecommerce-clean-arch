export type Product = {
  id: string
  name: string
  price: number
  stock: number
}

export type ProductsResponse = {
  products: Product[]
  nextCursor: string | null
}

export type OrderItem = {
  id: string
  productId: string
  productName: string
  unitPrice: number
  quantity: number
  subtotal: number
}

export type Order = {
  id: string
  userId: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  total: number
  items: OrderItem[]
}

export type OrderSummary = {
  id: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  total: number
}

export type OrdersResponse = {
  orders: OrderSummary[]
  nextCursor: string | null
}

export type SignInResponse = {
  token: string
}

export type User = {
  id: string
  name: string
  email: string
}
