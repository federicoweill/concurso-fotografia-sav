import { RateLimiterMemory } from 'rate-limiter-flexible'

// Rate limiter para login: máximo 5 intentos por minuto por IP
export const loginLimiter = new RateLimiterMemory({
  keyPrefix: 'login_fail',
  points: 5, // 5 intentos
  duration: 60, // por minuto
})

// Rate limiter para registro: máximo 3 registros por hora por IP
export const registerLimiter = new RateLimiterMemory({
  keyPrefix: 'register',
  points: 3, // 3 registros
  duration: 3600, // por hora
})

// Rate limiter para votación: máximo 10 votos por minuto por usuario
export const voteLimiter = new RateLimiterMemory({
  keyPrefix: 'vote',
  points: 10, // 10 votos
  duration: 60, // por minuto
})

// Helper para obtener IP del request
export function getIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1'
  return ip
}