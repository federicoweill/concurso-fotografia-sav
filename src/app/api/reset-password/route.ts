import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token y contraseña requeridos' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Buscar token válido
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 400 }
      )
    }

    // Verificar si expiró
    if (new Date() > resetToken.expiresAt) {
      // Eliminar token expirado
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      })
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 400 }
      )
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 400 }
      )
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    // Eliminar token usado
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    })

    return NextResponse.json(
      { message: 'Contraseña actualizada exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Error al restablecer la contraseña' },
      { status: 500 }
    )
  }
}