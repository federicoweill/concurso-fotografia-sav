'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [manualLink, setManualLink] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    setManualLink('')

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
        if (data.manualLink) {
          setManualLink(data.manualLink)
        }
        setEmail('')
      } else {
        setError(data.error || 'Error al procesar la solicitud')
      }
    } catch {
      setError('Error al procesar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Recuperar contraseña
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {message}
          </div>
        )}

        {manualLink && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
            <p className="text-sm text-yellow-800 mb-2">
              <strong>Para administradores:</strong> El servicio de email no está configurado. 
              Copiá este enlace y envialo manualmente al usuario:
            </p>
            <div className="bg-white p-2 rounded border break-all text-xs text-gray-600">
              {manualLink}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(manualLink)}
              className="mt-2 w-full py-1 px-2 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
            >
              Copiar enlace
            </button>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Email"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Volver al login
          </Link>
        </div>
      </div>
    </div>
  )
}