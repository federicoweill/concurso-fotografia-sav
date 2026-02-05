import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'CONTESTANT') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Check contest phase
    const settings = await prisma.contestSettings.findFirst()
    if (settings && settings.phase !== 'REGISTRATION') {
      return NextResponse.json(
        { error: 'El período de inscripción ha cerrado' },
        { status: 400 }
      )
    }

    // Check if user already has a photo
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

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'El archivo debe ser menor a 10MB' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return NextResponse.json(
        { error: 'Solo se permiten archivos JPG, PNG o WebP' },
        { status: 400 }
      )
    }

    // Save file locally
    await ensureUploadDir()
    
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Create unique filename
    const timestamp = Date.now()
    const filename = `${session.user.id}_${timestamp}_${file.name}`
    const filepath = join(UPLOAD_DIR, filename)
    
    await writeFile(filepath, buffer)
    
    // Create relative URL for the file
    const fileUrl = `/uploads/${filename}`

    // Save to database
    const photo = await prisma.photo.create({
      data: {
        title,
        fileUrl,
        fileKey: filename,
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

    // Check contest phase (only contestants can delete their own photos during registration)
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

    // Delete local file
    try {
      const { unlink } = await import('fs/promises')
      await unlink(join(UPLOAD_DIR, photo.fileKey))
    } catch (err) {
      console.error('Error deleting file:', err)
      // Continue even if file doesn't exist
    }

    // Delete from database
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