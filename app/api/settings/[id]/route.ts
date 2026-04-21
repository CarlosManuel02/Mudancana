import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import {
  getSettingByKey,
  upsertSetting,
  deleteSetting
} from '@/lib/db'
import { settingSchema } from '@/lib/validations'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession()

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'No autorizado' },
      { status: 401 }
    )
  }

  const { id } = await params
  const setting = await getSettingByKey(id)

  if (!setting) {
    return NextResponse.json(
      { success: false, error: 'No encontrado' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    data: setting
  })
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await req.json()

    const result = settingSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos' },
        { status: 400 }
      )
    }

    const saved = await upsertSetting(
      id,
      String(result.data.value ?? ''),
      result.data.description
    )

    return NextResponse.json({
      success: true,
      data: saved
    })

  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { success: false, error: 'Error interno' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession()

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'No autorizado' },
      { status: 401 }
    )
  }

  const { id } = await params
  const deleted = await deleteSetting(id)

  return NextResponse.json({
    success: deleted
  })
}