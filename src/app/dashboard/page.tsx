'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AdminDashboard } from '@/components/admin-dashboard'
import { UserDashboard } from '@/components/user-dashboard'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/')
      return
    }

    fetchDashboardData()
  }, [session, status, router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      if (session?.user.role === 'ADMIN') {
        // Fetch admin data
        const [usersRes, photosRes, settingsRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/photos/all'),
          fetch('/api/settings')
        ])

        const users = await usersRes.json()
        const photosData = await photosRes.json()
        const settings = await settingsRes.json()

        let results = null
        if (settings?.phase === 'RESULTS') {
          results = photosData.photos.slice(0, 3).map((photo: any, index: number) => ({
            position: index + 1,
            photo,
          }))
        }

        setData({ users: users.users || [], photos: photosData.photos || [], settings, results, isAdmin: true })
      } else {
        // Fetch user data
        const [userRes, photosRes, settingsRes] = await Promise.all([
          fetch('/api/user'),
          fetch('/api/photos/all'),
          fetch('/api/settings')
        ])

        const user = await userRes.json()
        const photosData = await photosRes.json()
        const settings = await settingsRes.json()

        setData({ user, photos: photosData.photos || [], settings, isAdmin: false })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">Error al cargar los datos</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (data.isAdmin) {
    return (
      <AdminDashboard 
        users={data.users} 
        photos={data.photos} 
        settings={data.settings} 
        results={data.results} 
      />
    )
  }

  return (
    <UserDashboard 
      user={data.user} 
      photos={data.photos} 
      settings={data.settings} 
    />
  )
}
