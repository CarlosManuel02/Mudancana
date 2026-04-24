import { NextRequest, NextResponse } from 'next/server'
import { hashPassword } from '@/lib/auth'
import {deleteUser, getAllUsers, getUserById, updateUser} from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getUserById(id)

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existingUser = await getUserById(id)
    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // If the password is being updated, hash it
    if (body.password && body.password.trim() !== '') {
      body.password = await hashPassword(body.password)
    } else {
      // Keep an existing password if not provided
      delete body.password
    }

    const updatedUser = await updateUser(id, body)

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Error al actualizar usuario' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existingUser = await getUserById(id)
    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Prevent deleting the last admin
    const allUsers = await getAllUsers()
    const admins = allUsers.filter((u: { role: string }) => u.role === 'admin')
    if (admins.length === 1 && existingUser.role === 'admin') {
      return NextResponse.json(
        { error: 'No puedes eliminar el único administrador' },
        { status: 400 }
      )
    }

    await deleteUser(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Error al eliminar usuario' },
      { status: 500 }
    )
  }
}
