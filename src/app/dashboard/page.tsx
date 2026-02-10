import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserDashboard } from '@/components/user-dashboard'
import { AdminDashboard } from '@/components/admin-dashboard'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  const settings = await prisma.contestSettings.findFirst()

  if (session.user.role === 'ADMIN') {
    // Fetch admin data
    const users = await prisma.user.findMany({
      include: {
        photo: true,
        votes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const photos = await prisma.photo.findMany({
      include: {
        contestant: {
          select: {
            name: true,
          },
        },
        votes: true,
      },
      orderBy: {
        voteCount: 'desc',
      },
    })

    let results = null
    if (settings?.phase === 'RESULTS') {
      results = photos.slice(0, 3).map((photo, index) => ({
        position: index + 1,
        photo,
      }))
    }

    return (
      <AdminDashboard
        users={users}
        photos={photos}
        settings={settings}
        results={results}
      />
    )
  }

  // USER role
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      photo: true,
      votes: {
        include: {
          photo: {
            include: {
              contestant: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  })

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

  return (
    <UserDashboard
      user={user}
      photos={photos}
      settings={settings}
    />
  )
}
