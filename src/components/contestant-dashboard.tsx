'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import Image from 'next/image'

interface ContestantDashboardProps {
  user: any
  photo: any
  settings: any
}

export function ContestantDashboard({ user, photo, settings }: ContestantDashboardProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [photoTitle, setPhotoTitle] = useState('')

  const canUpload = !settings || settings.phase === 'REGISTRATION'
  const phaseLabel = settings?.phase === 'JUDGING' 
    ? 'Período de evaluación' 
    : settings?.phase === 'RESULTS'
    ? 'Resultados publicados'
    : 'Período de inscripción'

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
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
    // Pre-fill title with filename (without extension)
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

  const handleCancel = () => {
    setSelectedFile(null)
    setPhotoTitle('')
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Concurso de Fotografía - SAV</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.name}</span>
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
          <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Mi Participación</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                settings?.phase === 'REGISTRATION' 
                  ? 'bg-green-100 text-green-800'
                  : settings?.phase === 'JUDGING'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {phaseLabel}
              </span>
            </div>

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

            {!photo ? (
              <div className="text-center py-12">
                {!selectedFile ? (
                  // Step 1: Select file
                  <>
                    <div className="mx-auto h-24 w-24 text-gray-400">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No has subido ninguna foto</h3>
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
                  // Step 2: Add title and upload
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Ingresa un título descriptivo para tu fotografía
                      </p>
                    </div>

                    <div className="flex space-x-3 justify-center">
                      <button
                        onClick={handleUpload}
                        disabled={uploading || !photoTitle.trim()}
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {uploading ? 'Subiendo...' : 'Subir foto'}
                      </button>
                      <button
                        onClick={handleCancel}
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
                      src={photo.fileUrl}
                      alt={photo.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900">{photo.title}</h3>
                    {photo.description && (
                      <p className="mt-1 text-sm text-gray-500">{photo.description}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-400">
                      Subida el {new Date(photo.uploadedAt).toLocaleDateString('es-AR')}
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
        </div>
      </main>
    </div>
  )
}