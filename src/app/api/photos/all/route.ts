import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const photos = await prisma.photo.findMany({
      include: {
        contestant: {
          select: { name: true }
        }
      },
      orderBy: { uploadedAt: 'desc' }
    })

    return NextResponse.json({ photos })
  } catch (error) {
    console.error('Error fetching photos:', error)
    return NextResponse.json({ error: 'Error al obtener fotos' }, { status: 500 })
  }
}
