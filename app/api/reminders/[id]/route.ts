import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getReminderById, updateReminder, deleteReminder, markReminderAsSent } from '@/lib/db'
import { reminderSchema } from '@/lib/validations'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const reminder = await getReminderById(id)

    if (!reminder) {
      return NextResponse.json(
        { success: false, error: 'Recordatorio no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: reminder })
  } catch (error) {
    console.error('Error fetching reminder:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    
    // Manejar marcar como enviado
    if (body.markAsSent) {
      const reminder = await markReminderAsSent(id)
      if (!reminder) {
        return NextResponse.json(
          { success: false, error: 'Recordatorio no encontrado' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, data: reminder })
    }

    const result = reminderSchema.partial().safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const reminder = await updateReminder({ id, ...result.data })

    if (!reminder) {
      return NextResponse.json(
        { success: false, error: 'Recordatorio no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: reminder })
  } catch (error) {
    console.error('Error updating reminder:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const deleted = await deleteReminder(id)

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Recordatorio no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting reminder:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
