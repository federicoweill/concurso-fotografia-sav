'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import Image from 'next/image'

interface JudgeDashboardProps {
  photos: any[]
  userVotes: any[]
  canVote: boolean
  settings: any
}

export function JudgeDashboard({ photos, userVotes, canVote, settings }: JudgeDashboardProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [voting, setVoting] = useState(false)

  const hasVoted = userVotes.length > 0
  const votedPhotoId = hasVoted ? userVotes[0].photoId : null

  const phaseLabel = settings?.phase === 'JUDGING' 
    ? 'Período de evaluación' 
    : settings?.phase === 'RESULTS'
    ? 'Resultados publicados'
    : 'Esperando inicio de evaluación'

  const handleVote = async (photoId: string) => {
    if (!canVote || hasVoted) return

    setVoting(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al votar')
      } else {
        setSuccess('¡Voto registrado exitosamente!')
        setTimeout(() => window.location.reload(), 1500)
      }
    } catch {
      setError('Error al votar')
    } finally {
      setVoting(false)
    }
  }

  const handleRemoveVote = async () => {
    if (!canVote || !hasVoted) return

    if (!confirm('¿Estás seguro de que deseas cambiar tu voto?')) return

    try {
      const response = await fetch('/api/votes', {
        method: 'DELETE',
      })

      if (response.ok) {
        window.location.reload()
      } else {
        setError('Error al eliminar el voto')
      }
    } catch {
      setError('Error al eliminar el voto')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Concurso de Fotografía - SAV</h1>
              <span className="ml-4 text-sm text-gray-500">Panel de Jurado</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                settings?.phase === 'JUDGING' 
                  ? 'bg-yellow-100 text-yellow-800'
                  : settings?.phase === 'RESULTS'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {phaseLabel}
              </span>
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

          {hasVoted && (
            <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded flex justify-between items-center">
              <span>Ya has emitido tu voto</span>
              {canVote && (
                <button
                  onClick={handleRemoveVote}
                  className="text-sm text-blue-800 hover:text-blue-900 underline"
                >
                  Cambiar voto
                </button>
              )}
            </div>
          )}

          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Total de fotografías: {photos.length}
            </p>
          </div>

          {photos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay fotografías para evaluar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className={`bg-white rounded-lg shadow overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                    votedPhotoId === photo.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <div className="relative aspect-video bg-gray-100">
                    <Image
                      src={photo.fileUrl}
                      alt={photo.title || `Fotografía ${index + 1}`}
                      fill
                      className="object-contain"
                    />
                    {votedPhotoId === photo.id && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                        TU VOTO
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                      {photo.title || `Fotografía #${index + 1}`}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      #{index + 1} de {photos.length}
                    </p>
                    {canVote && !hasVoted && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleVote(photo.id)
                        }}
                        disabled={voting}
                        className="mt-3 w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {voting ? 'Votando...' : 'Votar'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal for full-size photo */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedPhoto.title || 'Fotografía'}
              </h3>
            </div>
            <div className="relative aspect-video bg-gray-900">
              <Image
                src={selectedPhoto.fileUrl}
                alt={selectedPhoto.title || 'Fotografía'}
                fill
                className="object-contain"
              />
            </div>
            <div className="p-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Haz clic fuera de la imagen para cerrar
              </span>
              <div className="flex space-x-2">
                {canVote && !hasVoted && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleVote(selectedPhoto.id)
                    }}
                    disabled={voting}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {voting ? 'Votando...' : 'Votar por esta foto'}
                  </button>
                )}
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}