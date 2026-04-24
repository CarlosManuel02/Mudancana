import { NextResponse } from 'next/server'
import {
  updateServiceType,
  deleteServiceType,
  getServiceTypeById,
} from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const exists = await getServiceTypeById(id)

    if (!exists) {
      return NextResponse.json(
        {
          success: false,
          message: 'Tipo no encontrado',
        },
        { status: 404 }
      )
    }

    const data = await updateServiceType(id, body.name)

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: 'Error al actualizar',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const deleted = await deleteServiceType(id)

    return NextResponse.json({
      success: deleted,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: 'Error al eliminar',
      },
      { status: 500 }
    )
  }
}