'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { setToken, clearToken, getToken, decodeToken } from '@/lib/auth'
import type { SignInResponse, User } from '@/lib/types'

export function useCurrentUser() {
  return useQuery<User | null>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const token = getToken()
      if (!token) return null
      const payload = decodeToken(token)
      if (!payload) return null
      return api.get<User>(`/users/${payload.userId}`)
    },
    staleTime: Infinity,
    retry: false,
  })
}

export function useSignIn() {
  const qc = useQueryClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post<SignInResponse>('/auth/sign-in', data),
    onSuccess: ({ token }) => {
      setToken(token)
      qc.invalidateQueries({ queryKey: ['currentUser'] })
      const redirect = searchParams.get('redirect') ?? '/'
      router.push(redirect)
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useSignUp() {
  const router = useRouter()
  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) =>
      api.post('/users', data),
    onSuccess: () => {
      toast.success('Conta criada com sucesso!')
      router.push('/auth/sign-in')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useSignOut() {
  const qc = useQueryClient()
  const router = useRouter()
  return () => {
    clearToken()
    qc.clear()
    router.push('/auth/sign-in')
  }
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: { email: string }) => api.post('/auth/forgot-password', data),
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useResetPassword() {
  const router = useRouter()
  return useMutation({
    mutationFn: (data: { token: string; newPassword: string }) =>
      api.post('/auth/reset-password', data),
    onSuccess: () => {
      toast.success('Senha redefinida com sucesso')
      router.push('/auth/sign-in')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, ...data }: { userId: string; name?: string; email?: string; password?: string }) =>
      api.put(`/users/${userId}`, data),
    onSuccess: () => {
      toast.success('Perfil atualizado')
      qc.invalidateQueries({ queryKey: ['currentUser'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}
