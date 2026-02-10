'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import Image from 'next/image'

interface AdminDashboardProps {
  users: any[]
  photos: any[]
  settings: any
  results: any[] | null
}

export function AdminDashboard({ users, photos, settings, results }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'photos' | 'settings' | 'results'>('users')
  const [editingUser, setEditingUser] = useState<any>(null)
  const [creatingUser, setCreatingUser] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esto también eliminará su foto.')) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        window.location.reload()
      } else {
        setError('Error al eliminar usuario')
      }
    } catch {
      setError('Error al eliminar usuario')
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta foto?')) return

    try {
      const response = await fetch(`/api/admin/photos/${photoId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        window.location.reload()
      } else {
        setError('Error al eliminar foto')
      }
    } catch {
      setError('Error al eliminar foto')
    }
  }

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const formData = new FormData(e.target as HTMLFormElement)
    const phase = formData.get('phase') as string

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase }),
      })

      if (response.ok) {
        setSuccess('Configuración actualizada')
        setTimeout(() => window.location.reload(), 1000)
      } else {
        setError('Error al actualizar configuración')
      }
    } catch {
      setError('Error al actualizar configuración')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    setLoading(true)
    setError('')

    const formData = new FormData(e.target as HTMLFormElement)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const role = formData.get('role') as string

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role }),
      })

      if (response.ok) {
        setEditingUser(null)
        window.location.reload()
      } else {
        setError('Error al actualizar usuario')
      }
    } catch {
      setError('Error al actualizar usuario')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.target as HTMLFormElement)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const role = formData.get('role') as string
    const password = formData.get('password') as string

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setCreatingUser(false)
        setSuccess('Usuario creado exitosamente')
        setTimeout(() => window.location.reload(), 1000)
      } else {
        setError(data.error || 'Error al crear usuario')
      }
    } catch {
      setError('Error al crear usuario')
    } finally {
      setLoading(false)
    }
  }

  const regularUsers = users.filter(u => u.role === 'USER')
  const admins = users.filter(u => u.role === 'ADMIN')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Concurso de Fotografía - SAV</h1>
              <span className="ml-4 text-sm text-gray-500">Panel de Administración</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => signOut()}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-bold">{regularUsers.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Fotografías</p>
              <p className="text-2xl font-bold">{photos.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Administradores</p>
              <p className="text-2xl font-bold">{admins.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Votos Emitidos</p>
              <p className="text-2xl font-bold">
                {users.reduce((acc, u) => acc + (u.votes?.length || 0), 0)}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {[
                  { id: 'users', label: 'Usuarios' },
                  { id: 'photos', label: 'Fotografías' },
                  { id: 'results', label: 'Resultados' },
                  { id: 'settings', label: 'Configuración' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-6 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  {success}
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  {/* Create User Button */}
                  {!creatingUser && !editingUser && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => setCreatingUser(true)}
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        + Crear Usuario
                      </button>
                    </div>
                  )}

                  {/* Create User Form */}
                  {creatingUser && (
                    <form onSubmit={handleCreateUser} className="bg-green-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium mb-4">Crear Nuevo Usuario</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Nombre</label>
                          <input
                            name="name"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <input
                            name="email"
                            type="email"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                          <input
                            name="password"
                            type="password"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                            required
                            minLength={6}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Rol</label>
                          <select
                            name="role"
                            defaultValue="USER"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                          >
                            <option value="USER">Usuario</option>
                            <option value="ADMIN">Administrador</option>
                          </select>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                          >
                            {loading ? 'Creando...' : 'Crear Usuario'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setCreatingUser(false)}
                            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Edit User Form */}
                  {editingUser && (
                    <form onSubmit={handleUpdateUser} className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium mb-4">Editar Usuario</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Nombre</label>
                          <input
                            name="name"
                            defaultValue={editingUser.name}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <input
                            name="email"
                            type="email"
                            defaultValue={editingUser.email}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Rol</label>
                          <select
                            name="role"
                            defaultValue={editingUser.role}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="USER">Usuario</option>
                            <option value="ADMIN">Administrador</option>
                          </select>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                          >
                            {loading ? 'Guardando...' : 'Guardar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingUser(null)}
                            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Users Table */}
                  {!creatingUser && !editingUser && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nombre
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Rol
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Foto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.map((user) => (
                            <tr key={user.id}>
                              <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  user.role === 'ADMIN' 
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {user.role === 'ADMIN' ? 'Admin' : 'Usuario'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {user.photo ? (
                                  <span className="text-green-600">✓ Sí</span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                <button
                                  onClick={() => setEditingUser(user)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Eliminar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Photos Tab */}
              {activeTab === 'photos' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {photos.map((photo, index) => (
                    <div key={photo.id} className="bg-white border rounded-lg overflow-hidden">
                      <div className="relative aspect-video bg-gray-100">
                        <Image
                          src={photo.fileUrl}
                          alt={photo.title}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-medium line-clamp-2">{photo.title}</p>
                        <p className="text-xs text-gray-500 mt-1">Por: {photo.contestant.name}</p>
                        <p className="text-xs text-gray-500">Votos: {photo.voteCount}</p>
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="mt-2 text-sm text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Results Tab */}
              {activeTab === 'results' && (
                <div>
                  {results ? (
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium">Ganadores</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {results.map((result) => (
                          <div
                            key={result.position}
                            className={`bg-white border-2 rounded-lg overflow-hidden ${
                              result.position === 1
                                ? 'border-yellow-400'
                                : result.position === 2
                                ? 'border-gray-400'
                                : 'border-orange-400'
                            }`}
                          >
                            <div className="relative aspect-video bg-gray-100">
                              <Image
                                src={result.photo.fileUrl}
                                alt={result.photo.title}
                                fill
                                className="object-contain"
                              />
                              <div className={`absolute top-2 left-2 px-3 py-1 rounded-full text-white font-bold ${
                                result.position === 1
                                  ? 'bg-yellow-400'
                                  : result.position === 2
                                  ? 'bg-gray-400'
                                  : 'bg-orange-400'
                              }`}>
                                #{result.position}
                              </div>
                            </div>
                            <div className="p-4">
                              <p className="font-medium">{result.photo.contestant.name}</p>
                              <p className="text-sm text-gray-600">{result.photo.title}</p>
                              <p className="text-sm text-gray-500">{result.photo.voteCount} votos</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">
                        Los resultados estarán disponibles cuando la fase de resultados esté activa
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <form onSubmit={handleUpdateSettings} className="space-y-6 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Fase del Concurso
                    </label>
                    <select
                      name="phase"
                      defaultValue={settings?.phase || 'REGISTRATION'}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="REGISTRATION">Inscripción</option>
                      <option value="JUDGING">Evaluación</option>
                      <option value="RESULTS">Resultados</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}