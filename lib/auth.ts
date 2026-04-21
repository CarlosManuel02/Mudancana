import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import type { AuthUser, Session } from './types'
import { getUserByEmail, getUserPasswordHash } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const SESSION_DURATION = 60 * 60 * 24 * 7 // 7 días en segundos

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  console.log('Verifying password:', password, 'against hash:', hash) // Debugging line
  console.log('bcrypt.compare result:', await bcrypt.compare(password, hash)) // Debugging line
  return bcrypt.compare(password, hash)
  // return password === 'admin123' // Para desarrollo, compara con la contraseña en texto plano
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: SESSION_DURATION }
  )
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser
    return decoded
  } catch {
    return null
  }
}

export async function login(email: string, password: string): Promise<Session | null> {
  const user = await getUserByEmail(email)
  console.log('User found for email', email, ':', user) // Debugging line
  if (!user || !user.is_active) {
    return null
  }

  const passwordHash = await getUserPasswordHash(email)
  console.warn('Password hash for', email, ':', passwordHash) // Debugging line
  if (!passwordHash) {
    return null
  }

  const isValid = await verifyPassword(password, passwordHash)
  console.log('Password valid for', email, ':', isValid) // Debugging line
  if (!isValid) {
    return null
  }

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }

  const token = generateToken(authUser)
  const expiresAt = new Date(Date.now() + SESSION_DURATION * 1000).toISOString()

  return {
    user: authUser,
    token,
    expires_at: expiresAt,
  }
}

export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    return null
  }

  return verifyToken(token)
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  })
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getSession()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth()
  if (user.role !== 'admin') {
    throw new Error('Forbidden')
  }
  return user
}
