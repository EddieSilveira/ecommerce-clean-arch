'use client'

import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { isAuthenticated } from '@/lib/auth'
import { useState, useEffect } from 'react'

export function HeroActions() {
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    setAuthed(isAuthenticated())
  }, [])

  return (
    <div className="flex items-center justify-center gap-4">
      <Link
        href="/products"
        className={buttonVariants({ size: 'lg', className: 'bg-amber-500 hover:bg-amber-400 text-black font-semibold' })}
      >
        Ver produtos
      </Link>
      {!authed && (
        <Link
          href="/auth/sign-up"
          className={buttonVariants({ size: 'lg', variant: 'outline', className: 'border-[#2a2a2a] hover:border-white' })}
        >
          Criar conta
        </Link>
      )}
    </div>
  )
}
