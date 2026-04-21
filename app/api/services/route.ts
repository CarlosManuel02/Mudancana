import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getServices, createService, getServiceTypes } from '@/lib/db'
import { serviceSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const clientId = searchParams.get('clientId') || undefined
    const status = searchParams.get('status') || undefined

    const services = await getServices(page, limit, clientId, status)
    const serviceTypes = await getServiceTypes()

    return NextResponse.json({ success: true, ...services, serviceTypes })
  } catch (error) {
    console.error('Error fetching services:', error)
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
    const result = serviceSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const service = await createService(result.data, user.id)

    return NextResponse.json({ success: true, data: service }, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
