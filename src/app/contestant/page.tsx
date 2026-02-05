import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ContestantDashboard } from '@/components/contestant-dashboard'

export default async function ContestantPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'CONTESTANT') {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { photo: true },
  })

  const settings = await prisma.contestSettings.findFirst()

  return (
    <ContestantDashboard
      user={user}
      photo={user?.photo}
      settings={settings}
    />
  )
}