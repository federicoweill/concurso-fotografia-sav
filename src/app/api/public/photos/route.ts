import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const photos = await prisma.photo.findMany({
      include: {
        contestant: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    })

    // Shuffle photos randomly
    const shuffledPhotos = photos.sort(() => Math.random() - 0.5)

    return NextResponse.json({ photos: shuffledPhotos })
  } catch (error) {
    console.error('Error fetching public photos:', error)
    return NextResponse.json(
      { error: 'Error al obtener fotos' },
      { status: 500 }
    )
  }
}
