import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { put, del } from '@vercel/blob'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'USER') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const settings = await prisma.contestSettings.findFirst()
    if (settings && settings.phase !== 'REGISTRATION') {
      return NextResponse.json(
        { error: 'El período de inscripción ha cerrado' },
        { status: 400 }
      )
    }

    const existingPhoto = await prisma.photo.findUnique({
      where: { contestantId: session.user.id },
    })

    if (existingPhoto) {
      return NextResponse.json(
        { error: 'Ya has subido una foto. Elimínala primero para subir una nueva.' },
        { status: 400 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string || file.name

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'El archivo debe ser menor a 10MB' },
        { status: 400 }
      )
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return NextResponse.json(
        { error: 'Solo se permiten archivos JPG, PNG o WebP' },
        { status: 400 }
      )
    }

    // Upload to Vercel Blob
    const blob = await put(`photos/${session.user.id}/${file.name}`, file, {
      access: 'public',
    })

    const photo = await prisma.photo.create({
      data: {
        title,
        fileUrl: blob.url,
        fileKey: blob.pathname,
        contestantId: session.user.id,
      },
    })

    return NextResponse.json({ photo }, { status: 201 })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Error al subir la foto' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const settings = await prisma.contestSettings.findFirst()
    if (session.user.role === 'CONTESTANT' && settings && settings.phase !== 'REGISTRATION') {
      return NextResponse.json(
        { error: 'No puedes eliminar fotos fuera del período de inscripción' },
        { status: 400 }
      )
    }

    const photo = await prisma.photo.findFirst({
      where: session.user.role === 'ADMIN' 
        ? {} 
        : { contestantId: session.user.id },
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
      where: { id: photo.id },
    })

    return NextResponse.json({ message: 'Foto eliminada' })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la foto' },
      { status: 500 }
    )
  }
}