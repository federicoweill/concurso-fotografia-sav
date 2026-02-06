import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'
import { registerLimiter, getIP } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = getIP(req)
    try {
      await registerLimiter.consume(ip)
    } catch {
      return NextResponse.json(
        { error: 'Demasiados intentos. Por favor, esperá una hora.' },
        { status: 429 }
      )
    }

    const { email } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // No revelar si el email existe o no (seguridad)
    if (!user) {
      return NextResponse.json(
        { message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña' },
        { status: 200 }
      )
    }

    // Generar token seguro
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    // Guardar token en base de datos
    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        token,
        expiresAt,
      },
    })

    // Construir URL de reset
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

    // Enviar email
    const emailResult = await sendPasswordResetEmail(user.email, resetUrl, user.name)

    // Si el email falla (ej: dominio no verificado), devolver el enlace para uso manual
    if (!emailResult.success) {
      console.log('Email failed, returning manual link for admin:', resetUrl)
      return NextResponse.json({
        message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña',
        debug: process.env.NODE_ENV === 'development' ? { resetUrl } : undefined,
        manualLink: resetUrl, // Para que el admin pueda copiar y enviar manualmente
      }, { status: 200 })
    }

    return NextResponse.json(
      { message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}