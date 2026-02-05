import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'JUDGE') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Check contest phase
    const settings = await prisma.contestSettings.findFirst()
    if (settings && settings.phase !== 'JUDGING') {
      return NextResponse.json(
        { error: 'El período de evaluación no está activo' },
        { status: 400 }
      )
    }

    const { photoId } = await req.json()

    // Check if judge already voted
    const existingVote = await prisma.vote.findFirst({
      where: { judgeId: session.user.id },
    })

    if (existingVote) {
      return NextResponse.json(
        { error: 'Ya has votado. Elimina tu voto anterior para cambiarlo.' },
        { status: 400 }
      )
    }

    // Create vote
    await prisma.$transaction(async (tx) => {
      await tx.vote.create({
        data: {
          judgeId: session.user.id,
          photoId,
        },
      })

      await tx.photo.update({
        where: { id: photoId },
        data: { voteCount: { increment: 1 } },
      })
    })

    return NextResponse.json({ message: 'Voto registrado' })
  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json(
      { error: 'Error al registrar voto' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'JUDGE') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Check contest phase
    const settings = await prisma.contestSettings.findFirst()
    if (settings && settings.phase !== 'JUDGING') {
      return NextResponse.json(
        { error: 'El período de evaluación ha cerrado' },
        { status: 400 }
      )
    }

    const existingVote = await prisma.vote.findFirst({
      where: { judgeId: session.user.id },
    })

    if (!existingVote) {
      return NextResponse.json(
        { error: 'No tienes un voto registrado' },
        { status: 400 }
      )
    }

    await prisma.$transaction(async (tx) => {
      await tx.vote.delete({
        where: { id: existingVote.id },
      })

      await tx.photo.update({
        where: { id: existingVote.photoId },
        data: { voteCount: { decrement: 1 } },
      })
    })

    return NextResponse.json({ message: 'Voto eliminado' })
  } catch (error) {
    console.error('Delete vote error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar voto' },
      { status: 500 }
    )
  }
}