import { NextRequest, NextResponse } from 'next/server'
import { hashPassword } from '@/lib/auth'
import { userSchema } from '@/lib/validations'
import {createUser, deleteUser, getAllUsers, getUserByEmail, getUserById, updateUser} from "@/lib/db";


export async function GET() {
  try {
    const users = await getAllUsers()
    // Remove passwords from response
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = userSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await getUserByEmail(validation.data.email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'El correo electrónico ya está registrado' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(validation.data.password)

    const newUser = await createUser({
      ...validation.data,
      password: hashedPassword,
    })

    // Remove password from response
    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Error al crear usuario' },
      { status: 500 }
    )
  }
}
