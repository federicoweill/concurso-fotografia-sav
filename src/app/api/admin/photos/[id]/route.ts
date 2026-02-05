import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { del } from '@vercel/blob'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const photo = await prisma.photo.findUnique({
      where: { id: params.id },
    })

    if (!photo) {
      return NextResponse.json(
        { error: 'Foto no encontrada' },
        { status: 404 }
      )
    }

    // Delete from Vercel Blob
    await del(photo.fileKey)

    await prisma.photo.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Foto eliminada' })
  } catch (error) {
    console.error('Delete photo error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar foto' },
      { status: 500 }
    )
  }
}