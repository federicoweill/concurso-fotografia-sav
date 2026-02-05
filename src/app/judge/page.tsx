import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { JudgeDashboard } from '@/components/judge-dashboard'

export default async function JudgePage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'JUDGE') {
    redirect('/login')
  }

  // Get photos without contestant info (anonymous)
  const photos = await prisma.photo.findMany({
    orderBy: { uploadedAt: 'asc' },
    include: {
      votes: {
        where: { judgeId: session.user.id },
      },
    },
  })

  const userVotes = await prisma.vote.findMany({
    where: { judgeId: session.user.id },
  })

  const settings = await prisma.contestSettings.findFirst()
  const canVote = !settings || settings.phase === 'JUDGING'

  return (
    <JudgeDashboard
      photos={photos}
      userVotes={userVotes}
      canVote={canVote}
      settings={settings}
    />
  )
}