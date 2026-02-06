import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { loginLimiter, getIP } from './lib/rate-limit'

export async function middleware(request: NextRequest) {
  // Aplicar rate limiting solo en login y registro
  if (request.nextUrl.pathname === '/api/auth/callback/credentials') {
    const ip = getIP(request)
    
    try {
      await loginLimiter.consume(ip)
    } catch {
      return NextResponse.json(
        { error: 'Demasiados intentos de login. Por favor, esperá un minuto.' },
        { status: 429 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/auth/callback/credentials', '/api/register'],
}