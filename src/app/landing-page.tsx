'use client'

import { useState, useEffect, useCallback } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

// Placeholder microscope images from Unsplash
const PLACEHOLDER_IMAGES = [
  {
    id: 'placeholder-1',
    fileUrl: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1200&h=800&fit=crop',
    title: 'Microscopía de células',
    contestant: { name: 'Imagen de referencia' },
  },
  {
    id: 'placeholder-2',
    fileUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1200&h=800&fit=crop',
    title: 'Estructura microscópica',
    contestant: { name: 'Imagen de referencia' },
  },
  {
    id: 'placeholder-3',
    fileUrl: 'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?w=1200&h=800&fit=crop',
    title: 'Análisis microbiológico',
    contestant: { name: 'Imagen de referencia' },
  },
  {
    id: 'placeholder-4',
    fileUrl: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=1200&h=800&fit=crop',
    title: 'Cultivo celular',
    contestant: { name: 'Imagen de referencia' },
  },
  {
    id: 'placeholder-5',
    fileUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1200&h=800&fit=crop',
    title: 'Investigación científica',
    contestant: { name: 'Imagen de referencia' },
  },
]

export default function LandingPage() {
  const router = useRouter()
  const [photos, setPhotos] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true)

  // Fetch photos
  useEffect(() => {
    async function fetchPhotos() {
      try {
        const response = await fetch('/api/public/photos')
        if (response.ok) {
          const data = await response.json()
          setPhotos(data.photos.length > 0 ? data.photos : PLACEHOLDER_IMAGES)
        } else {
          setPhotos(PLACEHOLDER_IMAGES)
        }
      } catch (error) {
        console.error('Error fetching photos:', error)
        setPhotos(PLACEHOLDER_IMAGES)
      } finally {
        setIsLoadingPhotos(false)
      }
    }

    fetchPhotos()
  }, [])

  // Auto-advance carousel
  useEffect(() => {
    if (photos.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [photos.length])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email o contraseña incorrectos')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const displayPhotos = photos.length > 0 ? photos : PLACEHOLDER_IMAGES

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Concurso fotográfico
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                XIV Congreso Argentino de Virología
              </p>
            </div>
            <Link
              href="https://viroarg.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Volver a viroarg.com
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section with Carousel */}
        <section className="relative bg-gray-900 overflow-hidden">
          <div className="absolute inset-0">
            {!isLoadingPhotos && displayPhotos.length > 0 && (
              <Image
                src={displayPhotos[currentIndex]?.fileUrl}
                alt={displayPhotos[currentIndex]?.title || 'Fotografía del concurso'}
                fill
                className="object-cover opacity-60 transition-opacity duration-500"
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left: Info */}
              <div className="text-white">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                  Participa en nuestro concurso
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8">
                  Sube tu fotografía científica, explora las imágenes de otros participantes 
                  y vota por tus favoritas. Una oportunidad única para mostrar tu trabajo 
                  en el XIV Congreso Argentino de Virología.
                </p>
                <div className="flex flex-wrap gap-4 text-sm sm:text-base">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Subí tu foto</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Mirá todas las fotos</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <span>Votá tu favorita</span>
                  </div>
                </div>
              </div>

              {/* Right: Login Form */}
              <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Iniciar sesión
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Accedé a tu cuenta para participar
                </p>

                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-500">
                    Las credenciales de acceso serán proporcionadas por la organización.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel Navigation */}
          {displayPhotos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {displayPhotos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Ir a imagen ${index + 1}`}
                />
              ))}
            </div>
          )}
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                ¿Cómo participar?
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                Seguí estos simples pasos para ser parte del concurso fotográfico
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl sm:text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  Iniciá sesión
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Usá tu email y contraseña proporcionados por la organización.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl sm:text-2xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  Subí tu foto
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Cada participante puede subir una fotografía relacionada con virología.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl sm:text-2xl font-bold text-blue-600">3</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  Votá
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Explorá todas las fotografías y votá por tu imagen favorita.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* About */}
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-4">
                Sociedad Argentina de Virología
              </h4>
              <p className="text-sm text-gray-400 mb-4">
                División de la Asociación Argentina de Microbiología (AAM)
              </p>
              <p className="text-sm text-gray-400">
                Dean Funes 472 (C1214AAD) - Ciudad Autónoma de Buenos Aires
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-4">
                Contacto
              </h4>
              <p className="text-sm text-gray-400 mb-2">
                Sede central AAM
              </p>
              <p className="text-sm text-gray-400 mb-2">
                Teléfonos: (54-11) 4932-8948 / (54-11) 4932-8858
              </p>
              <p className="text-sm text-gray-400">
                Email: infocav2026@viroarg.com
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-4">
                Links
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="https://viroarg.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    XIV Congreso Argentino de Virología
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://viroarg.com/codigo-de-conducta"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Código de conducta
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://viroarg.com/politica-de-privacidad"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Política de Privacidad
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Sociedad Argentina de Virología. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
