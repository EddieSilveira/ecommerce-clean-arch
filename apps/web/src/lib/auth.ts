const TOKEN_KEY = 'token'
const COOKIE_NAME = 'auth-token'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`
}

export function isAuthenticated(): boolean {
  return Boolean(getToken())
}

export type JwtPayload = {
  userId: string
  role: 'ADMIN' | 'CUSTOMER'
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1]!)) as JwtPayload
    return payload
  } catch {
    return null
  }
}

export function getCurrentUserId(): string | null {
  const token = getToken()
  if (!token) return null
  return decodeToken(token)?.userId ?? null
}

export function getCurrentRole(): 'ADMIN' | 'CUSTOMER' | null {
  const token = getToken()
  if (!token) return null
  return decodeToken(token)?.role ?? null
}
