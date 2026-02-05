import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Redirect based on role
  switch (session.user.role) {
    case 'ADMIN':
      redirect('/admin')
    case 'JUDGE':
      redirect('/judge')
    case 'CONTESTANT':
      redirect('/contestant')
    default:
      redirect('/login')
  }
}