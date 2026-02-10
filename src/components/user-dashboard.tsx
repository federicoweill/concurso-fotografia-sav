'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import Image from 'next/image'

interface UserDashboardProps {
  user: any
  photos: any[]
  settings: any
}

export function UserDashboard({ user, photos, settings }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState<'my-photo' | 'gallery' | 'voting'>('my-photo')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [photoTitle, setPhotoTitle] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null)
  const [voting, setVoting] = useState(false)

  const hasVoted = user.votes.length > 0
  const votedPhotoId = hasVoted ? user.votes[0].photoId : null

  const canUpload = !settings || settings.phase === 'REGISTRATION'
  const canVote = settings?.phase === 'JUDGING'
  const phaseLabel = settings?.phase === 'JUDGING' 
    ? 'Período de evaluación' 
    : settings?.phase === 'RESULTS'
    ? 'Resultados publicados'
    : 'Período de inscripción'

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo debe ser menor a 10MB')
      return
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Solo se permiten archivos JPG, PNG o WebP')
      return
    }

    setSelectedFile(file)
    setError('')
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
    setPhotoTitle(fileNameWithoutExt)
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    if (!photoTitle.trim()) {
      setError('Debes ingresar un título para la fotografía')
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('title', photoTitle.trim())

      const response = await fetch('/api/photos', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al subir la foto')
      } else {
        setSuccess('Foto subida exitosamente')
        setSelectedFile(null)
        setPhotoTitle('')
        window.location.reload()
      }
    } catch {
      setError('Error al subir la foto')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar tu foto?')) return

    try {
      const response = await fetch('/api/photos', {
        method: 'DELETE',
      })

      if (response.ok) {
        window.location.reload()
      } else {
        setError('Error al eliminar la foto')
      }
    } catch {
      setError('Error al eliminar la foto')
    }
  }

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
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 space-y-4 sm:space-y-0">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Concurso de Fotografía - SAV</h1>
              <span className="hidden sm:inline ml-4 text-sm text-gray-500">{user.name}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                settings?.phase === 'REGISTRATION' 
                  ? 'bg-green-100 text-green-800'
                  : settings?.phase === 'JUDGING'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
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

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {[
                { id: 'my-photo', label: 'Mi Foto' },
                { id: 'gallery', label: 'Galería' },
                { id: 'voting', label: 'Votación' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-4 sm:px-6 border-b-2 font-medium text-sm whitespace-nowrap ${
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

          <div className="p-4 sm:p-6">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
                {success}
              </div>
            )}

            {/* My Photo Tab */}
            {activeTab === 'my-photo' && (
              <div>
                {!user.photo ? (
                  <div className="text-center py-8 sm:py-12">
                    {!selectedFile ? (
                      <>
                        <div className="mx-auto h-16 w-16 sm:h-24 sm:w-24 text-gray-400">
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="mt-2 text-base sm:text-lg font-medium text-gray-900">No has subido ninguna foto</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {canUpload 
                            ? 'Sube tu mejor fotografía científica para participar.'
                            : 'El período de inscripción ha cerrado.'
                          }
                        </p>
                        {canUpload && (
                          <div className="mt-6">
                            <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                              <span>Seleccionar foto</span>
                              <input
                                type="file"
                                className="sr-only"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleFileSelect}
                                disabled={uploading}
                              />
                            </label>
                            <p className="mt-2 text-xs text-gray-500">
                              Máximo 10MB. Formatos: JPG, PNG, WebP
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="max-w-md mx-auto">
                        <div className="mb-4">
                          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                            <Image
                              src={URL.createObjectURL(selectedFile)}
                              alt="Preview"
                              fill
                              className="object-contain"
                            />
                          </div>
                          <p className="text-sm text-gray-600 mb-4">
                            Archivo: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        </div>
                        
                        <div className="mb-4">
                          <label htmlFor="photoTitle" className="block text-sm font-medium text-gray-700 mb-1">
                            Título de la fotografía *
                          </label>
                          <input
                            type="text"
                            id="photoTitle"
                            value={photoTitle}
                            onChange={(e) => setPhotoTitle(e.target.value)}
                            placeholder="Ej: Microscopía de células en cultivo"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                            required
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Ingresa un título descriptivo para tu fotografía
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 justify-center">
                          <button
                            onClick={handleUpload}
                            disabled={uploading || !photoTitle.trim()}
                            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                          >
                            {uploading ? 'Subiendo...' : 'Subir foto'}
                          </button>
                          <button
                            onClick={() => { setSelectedFile(null); setPhotoTitle(''); setError(''); }}
                            disabled={uploading}
                            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="border rounded-lg overflow-hidden">
                      <div className="relative aspect-video bg-gray-100">
                        <Image
                          src={user.photo.fileUrl}
                          alt={user.photo.title}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-900">{user.photo.title}</h3>
                        <p className="mt-2 text-xs text-gray-400">
                          Subida el {new Date(user.photo.uploadedAt).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                    </div>

                    {canUpload && (
                      <div className="flex justify-end">
                        <button
                          onClick={handleDelete}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Eliminar foto
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Gallery Tab */}
            {activeTab === 'gallery' && (
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Total de fotografías: {photos.length}
                  </p>
                </div>

                {photos.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Aún no hay fotografías en el concurso</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {photos.map((photo, index) => (
                      <div
                        key={photo.id}
                        className="bg-white rounded-lg shadow overflow-hidden cursor-pointer transition-all hover:shadow-lg"
                        onClick={() => setSelectedPhoto(photo)}
                      >
                        <div className="relative aspect-video bg-gray-100">
                          <Image
                            src={photo.fileUrl}
                            alt={photo.title || `Fotografía ${index + 1}`}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="p-3 sm:p-4">
                          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                            {photo.title || `Fotografía #${index + 1}`}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            Por: {photo.contestant.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Voting Tab */}
            {activeTab === 'voting' && (
              <div>
                {!canVote ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      La votación no está disponible en este momento.
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      {settings?.phase === 'REGISTRATION' 
                        ? 'El período de evaluación comenzará pronto.'
                        : settings?.phase === 'RESULTS'
                        ? 'El período de votación ha finalizado.'
                        : 'Espere al período de evaluación.'
                      }
                    </p>
                  </div>
                ) : (
                  <>
                    {hasVoted && (
                      <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                        <span>Ya has emitido tu voto</span>
                        <button
                          onClick={handleRemoveVote}
                          className="text-sm text-blue-800 hover:text-blue-900 underline"
                        >
                          Cambiar voto
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {photos.map((photo, index) => (
                        <div
                          key={photo.id}
                          className={`bg-white rounded-lg shadow overflow-hidden transition-all hover:shadow-lg ${
                            votedPhotoId === photo.id ? 'ring-2 ring-blue-500' : ''
                          }`}
                        >
                          <div 
                            className="relative aspect-video bg-gray-100 cursor-pointer"
                            onClick={() => setSelectedPhoto(photo)}
                          >
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
                          <div className="p-3 sm:p-4">
                            <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                              {photo.title || `Fotografía #${index + 1}`}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Por: {photo.contestant.name}
                            </p>
                            {!hasVoted && (
                              <button
                                onClick={() => handleVote(photo.id)}
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
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">
                {selectedPhoto.title || 'Fotografía'}
              </h3>
              <p className="text-sm text-gray-500">
                Por: {selectedPhoto.contestant.name}
              </p>
            </div>
            <div className="relative aspect-video bg-gray-900">
              <Image
                src={selectedPhoto.fileUrl}
                alt={selectedPhoto.title || 'Fotografía'}
                fill
                className="object-contain"
              />
            </div>
            <div className="p-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
              <span className="text-sm text-gray-500">
                Haz clic fuera de la imagen para cerrar
              </span>
              <div className="flex space-x-2">
                {activeTab === 'voting' && canVote && !hasVoted && (
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
