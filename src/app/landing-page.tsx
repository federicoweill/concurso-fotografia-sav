'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

// Placeholder microscope images
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
]

export default function LandingPage() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Simple carousel - just rotate through placeholders
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PLACEHOLDER_IMAGES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

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
      }
    } catch (err) {
      setError('Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const currentImage = PLACEHOLDER_IMAGES[currentIndex]

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
        <section className="relative bg-gray-900 overflow-hidden min-h-[600px]">
          <div className="absolute inset-0">
            <Image
              src={currentImage.fileUrl}
              alt={currentImage.title}
              fill
              className="object-cover opacity-60"
              priority
            />
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
                  y vota por tus favoritas.
                </p>
                <div className="flex flex-wrap gap-4 text-sm sm:text-base">
                  <div className="flex items-center">
                    <span className="text-blue-400 mr-2">📷</span>
                    <span>Subí tu foto</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-blue-400 mr-2">👁</span>
                    <span>Mirá todas las fotos</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-blue-400 mr-2">⭐</span>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-500">
                    Las credenciales serán proporcionadas por la organización.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                ¿Cómo participar?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">1</div>
                <h3 className="text-lg font-semibold mb-2">Iniciá sesión</h3>
                <p className="text-sm text-gray-600">Usá tus credenciales</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">2</div>
                <h3 className="text-lg font-semibold mb-2">Subí tu foto</h3>
                <p className="text-sm text-gray-600">Una foto por participante</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
                <h3 className="text-lg font-semibold mb-2">Votá</h3>
                <p className="text-sm text-gray-600">Elegí tu favorita</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            © 2026 Sociedad Argentina de Virología
          </p>
        </div>
      </footer>
    </div>
  )
}
