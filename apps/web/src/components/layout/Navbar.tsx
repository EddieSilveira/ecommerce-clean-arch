'use client'

import Link from 'next/link'
import { ShoppingCart, User, LogOut, Package, Settings } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useCartCount } from '@/store/cart'
import { useCurrentUser, useSignOut } from '@/hooks/use-auth'
import { getCurrentRole } from '@/lib/auth'
import { useState, useEffect } from 'react'
import { CartDrawer } from './CartDrawer'
import { cn } from '@/lib/utils'

export function Navbar() {
  const { data: user } = useCurrentUser()
  const signOut = useSignOut()
  const cartCount = useCartCount()
  const [cartOpen, setCartOpen] = useState(false)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    setRole(getCurrentRole())
  }, [user])

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#2a2a2a] bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight hover:text-amber-500 transition-colors">
            STORE
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/products" className="text-sm text-muted-foreground hover:text-white transition-colors">
              Produtos
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-muted-foreground hover:text-white transition-colors"
              aria-label="Carrinho"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <button className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-[#1a1a1a] text-white text-xs">
                        {user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                } />
                <DropdownMenuContent align="end" className="w-48 bg-[#1a1a1a] border-[#2a2a2a]">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-[#2a2a2a]" />
                  <DropdownMenuItem render={
                    <Link href="/orders" className="flex items-center gap-2 cursor-pointer">
                      <Package size={14} /> Meus pedidos
                    </Link>
                  } />
                  <DropdownMenuItem render={
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User size={14} /> Perfil
                    </Link>
                  } />
                  {role === 'ADMIN' && (
                    <DropdownMenuItem render={
                      <Link href="/admin/products" className="flex items-center gap-2 cursor-pointer">
                        <Settings size={14} /> Admin
                      </Link>
                    } />
                  )}
                  <DropdownMenuSeparator className="bg-[#2a2a2a]" />
                  <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer flex items-center gap-2">
                    <LogOut size={14} /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/auth/sign-in"
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'border-[#2a2a2a] hover:border-amber-500')}
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
