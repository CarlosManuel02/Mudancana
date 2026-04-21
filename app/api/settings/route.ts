import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getSettings } from '@/lib/db'

export async function GET() {
  try {
    const user = await getSession()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const settings = await getSettings()

    return NextResponse.json({
      success: true,
      data: settings
    })

  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { success: false, error: 'Error interno' },
      { status: 500 }
    )
  }
}