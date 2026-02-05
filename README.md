# Concurso de Fotografía - Sociedad Argentina de Virología

Plataforma para gestionar un concurso de fotografía científica con sistema de votación anónima.

## Características

### Para Participantes
- Registro y autenticación
- Subir 1 fotografía (máximo 10MB, formatos: JPG, PNG, WebP)
- Ver su fotografía subida
- Eliminar y reemplazar foto durante el período de inscripción

### Para Jurados
- Ver todas las fotografías anónimamente (sin información del autor)
- Votar por su fotografía favorita (1 voto por jurado)
- Cambiar su voto durante el período de evaluación
- Ver las fotografías en tamaño completo

### Para Administradores
- Gestión completa de usuarios (crear, editar, eliminar)
- Gestión de fotografías (eliminar cualquier foto)
- Control de fases del concurso:
  - **Inscripción**: Participantes pueden registrarse y subir fotos
  - **Evaluación**: Jurados votan anónimamente
  - **Resultados**: Muestra los ganadores
- Ver estadísticas en tiempo real
- Panel de resultados con top 3

## Fases del Concurso

1. **REGISTRATION (Inscripción)**
   - Los participantes pueden registrarse
   - Los participantes pueden subir/reemplazar fotos
   - Los jurados no pueden votar aún

2. **JUDGING (Evaluación)**
   - Los participantes están bloqueados
   - Los jurados pueden ver fotos anónimamente
   - Los jurados emiten su voto
   - Cada jurado tiene 1 voto

3. **RESULTS (Resultados)**
   - Muestra las 3 fotos más votadas
   - Revela los nombres de los ganadores
   - Fase de solo lectura

## Tecnologías

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de Datos**: PostgreSQL (Vercel Postgres)
- **ORM**: Prisma
- **Autenticación**: NextAuth.js
- **Almacenamiento de Fotos**: Vercel Blob
- **Deployment**: Vercel

## Despliegue

Ver [DEPLOY.md](./DEPLOY.md) para instrucciones detalladas.

## Estructura del Proyecto

```
concurso-fotografia/
├── prisma/
│   ├── schema.prisma      # Esquema de base de datos
│   └── seed.ts            # Script para crear usuario admin
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API routes
│   │   ├── admin/         # Panel de administración
│   │   ├── contestant/    # Panel del participante
│   │   ├── judge/         # Panel del jurado
│   │   ├── login/         # Página de login
│   │   ├── register/      # Página de registro
│   │   ├── page.tsx       # Página principal (redirecciona según rol)
│   │   └── layout.tsx     # Layout raíz
│   ├── components/        # Componentes React
│   ├── lib/               # Utilidades (db, auth)
│   └── types/             # Tipos TypeScript
├── DEPLOY.md              # Guía de despliegue
└── README.md              # Este archivo
```

## Instalación Local

```bash
# Clonar repositorio
git clone <repo-url>
cd concurso-fotografia

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus configuraciones

# Generar cliente de Prisma
npx prisma generate

# Crear base de datos y ejecutar migraciones
npx prisma migrate dev

# Crear usuario admin
npx prisma db seed

# Iniciar servidor de desarrollo
npm run dev
```

## Variables de Entorno

```env
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/concurso_fotografia"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secreto-seguro"

# Vercel Blob
BLOB_READ_WRITE_TOKEN="tu-token"

# Admin inicial (para seed)
ADMIN_EMAIL="admin@sav.org.ar"
ADMIN_PASSWORD="tu-password"
```

## Uso

1. **Iniciar sesión como admin** y configurar la fase del concurso
2. **Compartir el enlace de registro** con los participantes
3. **Crear cuentas de jurado** desde el panel de administración
4. **Cambiar a fase JUDGING** cuando cierre la inscripción
5. **Los jurados votan** anónimamente
6. **Cambiar a fase RESULTS** para mostrar ganadores

## Seguridad

- Contraseñas hasheadas con bcrypt
- Autenticación con JWT
- Verificación de roles en cada endpoint
- Validación de archivos (tipo y tamaño)
- Votación anónima (los jurados no ven autores)
- Preparado para HTTPS en producción

## Licencia

MIT

## Contacto

Sociedad Argentina de Virología
## Deploy Status
- Último deploy: Thu Feb  5 18:09:59 -03 2026
- Status: Listo para producción
# Deploy attempt Thu Feb  5 20:05:49 -03 2026
