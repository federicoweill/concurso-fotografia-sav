import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const settings = await prisma.contestSettings.findFirst()
    return NextResponse.json(settings || { phase: 'REGISTRATION' })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ phase: 'REGISTRATION' })
  }
}
