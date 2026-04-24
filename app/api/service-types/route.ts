import {NextResponse} from 'next/server'
import {
  getServiceTypes,
  createServiceType,

} from "@/lib/db";

export async function GET() {
  try {
    const data = await getServiceTypes()

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: 'Error al obtener tipos de servicio',
      },
      {status: 500}
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: 'El nombre es requerido',
        },
        {status: 400}
      )
    }

    const data = await createServiceType(body.name)

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: 'Error al crear tipo de servicio',
      },
      {status: 500}
    )
  }
}