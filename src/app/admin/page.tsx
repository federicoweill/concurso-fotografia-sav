import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { AdminDashboard } from '@/components/admin-dashboard'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const users = await prisma.user.findMany({
    include: {
      photo: true,
      votes: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const photos = await prisma.photo.findMany({
    include: {
      contestant: {
        select: {
          name: true,
          email: true,
        },
      },
      votes: true,
    },
    orderBy: { voteCount: 'desc' },
  })

  const settings = await prisma.contestSettings.findFirst()

  // Calculate results if in results phase
  const results = settings?.phase === 'RESULTS' 
    ? photos.slice(0, 3).map((photo, index) => ({
        position: index + 1,
        photo,
      }))
    : null

  return (
    <AdminDashboard
      users={users}
      photos={photos}
      settings={settings}
      results={results}
    />
  )
}