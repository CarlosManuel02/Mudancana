import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getReminders, createReminder, getPendingReminders } from '@/lib/db'
import { reminderSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || undefined
    const pending = searchParams.get('pending') === 'true'

    if (pending) {
      const reminders = await getPendingReminders()
      return NextResponse.json({ success: true, data: reminders })
    }

    const reminders = await getReminders(page, limit, status)

    return NextResponse.json({ success: true, ...reminders })
  } catch (error) {
    console.error('Error fetching reminders:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const result = reminderSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const reminder = await createReminder(result.data, user.id)

    return NextResponse.json({ success: true, data: reminder }, { status: 201 })
  } catch (error) {
    console.error('Error creating reminder:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
