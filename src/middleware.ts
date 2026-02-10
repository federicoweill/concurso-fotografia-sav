import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Middleware simplificado - rate limiting implementado en APIs individuales
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
