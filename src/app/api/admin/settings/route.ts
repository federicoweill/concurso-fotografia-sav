import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/admin/settings
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const settings = await prisma.contestSettings.findFirst()

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración' },
      { status: 500 }
    )
  }
}

// POST /api/admin/settings
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { phase } = await req.json()

    // Validate phase
    const validPhases = ['REGISTRATION', 'JUDGING', 'RESULTS']
    if (!validPhases.includes(phase)) {
      return NextResponse.json(
        { error: 'Fase inválida' },
        { status: 400 }
      )
    }

    const existingSettings = await prisma.contestSettings.findFirst()

    let settings
    if (existingSettings) {
      settings = await prisma.contestSettings.update({
        where: { id: existingSettings.id },
        data: { phase },
      })
    } else {
      settings = await prisma.contestSettings.create({
        data: { phase },
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar configuración' },
      { status: 500 }
    )
  }
}