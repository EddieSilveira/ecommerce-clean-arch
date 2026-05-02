'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCurrentUser, useUpdateProfile } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { getCurrentUserId } from '@/lib/auth'
import { useEffect } from 'react'

const profileSchema = z.object({
  name: z.string().min(1, 'Informe o nome'),
  email: z.string().email('E-mail inválido'),
})

const passwordSchema = z
  .object({
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'As senhas não coincidem',
    path: ['confirm'],
  })

type ProfileData = z.infer<typeof profileSchema>
type PasswordData = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const { data: user, isLoading } = useCurrentUser()
  const { mutate: update, isPending } = useUpdateProfile()
  const userId = getCurrentUserId() ?? ''

  const profileForm = useForm<ProfileData>({ resolver: zodResolver(profileSchema) })
  const passwordForm = useForm<PasswordData>({ resolver: zodResolver(passwordSchema) })

  useEffect(() => {
    if (user) {
      profileForm.reset({ name: user.name, email: user.email })
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <Skeleton className="h-8 w-32 bg-[#111]" />
        <Skeleton className="h-40 rounded-lg bg-[#111]" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-10">
      <h1 className="text-3xl font-bold tracking-tight">Meu perfil</h1>

      {/* Personal data */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Dados pessoais</h2>
        <form
          onSubmit={profileForm.handleSubmit((d) => update({ userId, ...d }))}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input {...profileForm.register('name')} />
            {profileForm.formState.errors.name && (
              <p className="text-xs text-destructive">{profileForm.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input type="email" {...profileForm.register('email')} />
            {profileForm.formState.errors.email && (
              <p className="text-xs text-destructive">{profileForm.formState.errors.email.message}</p>
            )}
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Salvando…' : 'Salvar'}
          </Button>
        </form>
      </section>

      <Separator className="bg-[#2a2a2a]" />

      {/* Change password */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Alterar senha</h2>
        <form
          onSubmit={passwordForm.handleSubmit((d) => {
            update({ userId, password: d.password })
            passwordForm.reset()
          })}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>Nova senha</Label>
            <Input type="password" placeholder="Mínimo 8 caracteres" {...passwordForm.register('password')} />
            {passwordForm.formState.errors.password && (
              <p className="text-xs text-destructive">{passwordForm.formState.errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Confirmar senha</Label>
            <Input type="password" placeholder="Repita a senha" {...passwordForm.register('confirm')} />
            {passwordForm.formState.errors.confirm && (
              <p className="text-xs text-destructive">{passwordForm.formState.errors.confirm.message}</p>
            )}
          </div>
          <Button type="submit" variant="outline" disabled={isPending} className="border-[#2a2a2a]">
            {isPending ? 'Salvando…' : 'Alterar senha'}
          </Button>
        </form>
      </section>
    </div>
  )
}
