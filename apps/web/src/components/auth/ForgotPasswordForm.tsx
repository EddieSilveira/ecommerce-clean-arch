'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForgotPassword } from '@/hooks/use-auth'

const schema = z.object({ email: z.string().email('E-mail inválido') })
type FormData = z.infer<typeof schema>

export function ForgotPasswordForm() {
  const { mutate, isPending, isSuccess } = useForgotPassword()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">E-mail enviado</h1>
        <p className="text-sm text-muted-foreground">
          Se esse e-mail existir, você receberá as instruções em breve.
        </p>
        <Link href="/auth/sign-in" className="text-sm text-white hover:text-amber-500 transition-colors">
          Voltar ao login
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-6">
      <div className="text-center space-y-1 mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Esqueceu a senha?</h1>
        <p className="text-sm text-muted-foreground">Informe seu e-mail para redefinir</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" placeholder="seu@email.com" {...register('email')} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Enviando…' : 'Enviar instruções'}
      </Button>

      <p className="text-center">
        <Link href="/auth/sign-in" className="text-sm text-muted-foreground hover:text-white transition-colors">
          Voltar ao login
        </Link>
      </p>
    </form>
  )
}
