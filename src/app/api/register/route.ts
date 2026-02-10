import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: 'El registro público está deshabilitado. Las cuentas son creadas por la administración.' },
    { status: 403 }
  )
}
