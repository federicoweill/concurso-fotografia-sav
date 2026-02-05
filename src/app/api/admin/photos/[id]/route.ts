import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { join } from 'path'
import { unlink } from 'fs/promises'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')

// DELETE /api/admin/photos/[id] - Delete photo (admin only)
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

    // Delete local file
    try {
      await unlink(join(UPLOAD_DIR, photo.fileKey))
    } catch (err) {
      console.error('Error deleting file:', err)
      // Continue even if file doesn't exist
    }

    // Delete from database (votes will cascade)
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