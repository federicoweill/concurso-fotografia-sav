# Guía de Deploy en Vercel - Paso a Paso

## Paso 1: Crear Proyecto en Vercel

1. **Andá a https://vercel.com**
2. **Iniciá sesión** con tu cuenta de GitHub
3. **Hacé clic en "Add New..." → "Project"**
4. **Seleccioná** `concurso-fotografia-sav` de la lista de repositorios
5. **Dejá la configuración por defecto** y hacé clic en "Deploy"

⚠️ **IMPORTANTE**: El primer deploy va a fallar porque falta configurar la base de datos. Es normal.

---

## Paso 2: Configurar Base de Datos (Vercel Postgres)

1. **En el dashboard de Vercel**, hacé clic en tu proyecto
2. **Andá a la pestaña "Storage"**
3. **Hacé clic en "Create Database" → "Postgres"**
4. **Elegí la región** más cercana a tus usuarios (recomendado: Washington, D.C. para Sudamérica)
5. **Hacé clic en "Create"**

6. **Copiá estas variables** que se muestran después de crear la DB:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`

7. **Conectá la DB a tu proyecto**:
   - Hacé clic en "Connect Project"
   - Seleccioná tu proyecto `concurso-fotografia-sav`
   - Confirmá

---

## Paso 3: Configurar Almacenamiento (Vercel Blob)

1. **Andá a la pestaña "Storage"** en tu proyecto
2. **Hacé clic en "Create Database" → "Blob"**
3. **Nombralo** como quieras (ej: "concurso-fotos")
4. **Hacé clic en "Create"**

5. **Copiá el token** que se muestra:
   - `BLOB_READ_WRITE_TOKEN`

6. **Conectá el Blob a tu proyecto**

---

## Paso 4: Actualizar el Código para Producción

Antes de deployar, necesitás cambiar algunas cosas del código para usar PostgreSQL en lugar de SQLite:

### 4.1 Actualizar `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL") // Cambiar de sqlite a postgresql
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  password      String
  role          String    // CONTESTANT, JUDGE, ADMIN
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  photo         Photo?
  votes         Vote[]
  
  @@map("users")
}

model Photo {
  id            String    @id @default(cuid())
  title         String
  description   String?
  fileUrl       String
  fileKey       String
  uploadedAt    DateTime  @default(now())
  
  contestantId  String    @unique
  contestant    User      @relation(fields: [contestantId], references: [id], onDelete: Cascade)
  
  votes         Vote[]
  voteCount     Int       @default(0)
  
  @@map("photos")
}

model Vote {
  id            String    @id @default(cuid())
  createdAt     DateTime  @default(now())
  
  judgeId       String
  judge         User      @relation(fields: [judgeId], references: [id], onDelete: Cascade)
  
  photoId       String
  photo         Photo     @relation(fields: [photoId], references: [id], onDelete: Cascade)
  
  @@unique([judgeId, photoId])
  @@map("votes")
}

model ContestSettings {
  id                String   @id @default(cuid())
  phase             String   @default("REGISTRATION")
  registrationEnd   DateTime?
  judgingEnd        DateTime?
  maxFileSize       Int      @default(10485760)
  allowedFileTypes  String   @default("image/jpeg,image/png,image/webp")
  updatedAt         DateTime @updatedAt
  
  @@map("contest_settings")
}
```

### 4.2 Actualizar API para usar Vercel Blob

Reemplazá `/src/app/api/photos/route.ts` con este código:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { put, del } from '@vercel/blob'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'CONTESTANT') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const settings = await prisma.contestSettings.findFirst()
    if (settings && settings.phase !== 'REGISTRATION') {
      return NextResponse.json(
        { error: 'El período de inscripción ha cerrado' },
        { status: 400 }
      )
    }

    const existingPhoto = await prisma.photo.findUnique({
      where: { contestantId: session.user.id },
    })

    if (existingPhoto) {
      return NextResponse.json(
        { error: 'Ya has subido una foto. Elimínala primero para subir una nueva.' },
        { status: 400 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string || file.name

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'El archivo debe ser menor a 10MB' },
        { status: 400 }
      )
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return NextResponse.json(
        { error: 'Solo se permiten archivos JPG, PNG o WebP' },
        { status: 400 }
      )
    }

    // Upload to Vercel Blob
    const blob = await put(`photos/${session.user.id}/${file.name}`, file, {
      access: 'public',
    })

    const photo = await prisma.photo.create({
      data: {
        title,
        fileUrl: blob.url,
        fileKey: blob.pathname,
        contestantId: session.user.id,
      },
    })

    return NextResponse.json({ photo }, { status: 201 })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Error al subir la foto' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const settings = await prisma.contestSettings.findFirst()
    if (session.user.role === 'CONTESTANT' && settings && settings.phase !== 'REGISTRATION') {
      return NextResponse.json(
        { error: 'No puedes eliminar fotos fuera del período de inscripción' },
        { status: 400 }
      )
    }

    const photo = await prisma.photo.findFirst({
      where: session.user.role === 'ADMIN' 
        ? {} 
        : { contestantId: session.user.id },
    })

    if (!photo) {
      return NextResponse.json(
        { error: 'Foto no encontrada' },
        { status: 404 }
      )
    }

    // Delete from Vercel Blob
    await del(photo.fileKey)

    await prisma.photo.delete({
      where: { id: photo.id },
    })

    return NextResponse.json({ message: 'Foto eliminada' })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la foto' },
      { status: 500 }
    )
  }
}
```

### 4.3 Actualizar API de admin

Reemplazá `/src/app/api/admin/photos/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { del } from '@vercel/blob'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const photo = await prisma.photo.findUnique({
      where: { id: params.id },
    })

    if (!photo) {
      return NextResponse.json(
        { error: 'Foto no encontrada' },
        { status: 404 }
      )
    }

    // Delete from Vercel Blob
    await del(photo.fileKey)

    await prisma.photo.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Foto eliminada' })
  } catch (error) {
    console.error('Delete photo error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar foto' },
      { status: 500 }
    )
  }
}
```

### 4.4 Actualizar API de admin para usuarios

Reemplazá `/src/app/api/admin/users/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { del } from '@vercel/blob'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { name, email, role } = await req.json()

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { name, email, role },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { photo: true },
    })

    if (user?.photo) {
      // Delete from Vercel Blob
      await del(user.photo.fileKey)
    }

    await prisma.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Usuario eliminado' })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar usuario' },
      { status: 500 }
    )
  }
}
```

---

## Paso 5: Configurar Variables de Entorno en Vercel

1. **Andá a Settings → Environment Variables** en tu proyecto de Vercel
2. **Agregá estas variables**:

```
POSTGRES_URL = (copiar de Vercel Postgres)
POSTGRES_PRISMA_URL = (copiar de Vercel Postgres)
POSTGRES_URL_NON_POOLING = (copiar de Vercel Postgres)
NEXTAUTH_URL = (Vercel lo completa automáticamente)
NEXTAUTH_SECRET = (generar con: openssl rand -base64 32)
BLOB_READ_WRITE_TOKEN = (copiar de Vercel Blob)
```

3. **Hacé clic en "Save"**

---

## Paso 6: Actualizar next.config.js

Asegurate de tener esto en tu `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
}

module.exports = nextConfig
```

---

## Paso 7: Hacer Commit y Push

```bash
git add .
git commit -m "Prepare for Vercel deployment: PostgreSQL + Blob storage"
git push origin main
```

---

## Paso 8: Redeploy

1. **Vercel va a detectar automáticamente** el push y va a hacer deploy
2. **Si falla**, hacé clic en "Redeploy" en el dashboard

---

## Paso 9: Configurar Base de Datos (Migraciones)

Una vez deployado, tenés que correr las migraciones:

### Opción A: Desde Vercel CLI

```bash
# Instalar Vercel CLI si no lo tenés
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Pull env vars
vercel env pull .env.production

# Run migrations
npx prisma migrate deploy
```

### Opción B: Desde el Dashboard

1. **Andá a tu proyecto en Vercel**
2. **Andá a "Storage" → tu Postgres database**
3. **Hacé clic en "Query"**
4. **Ejecutá el SQL para crear las tablas** (o usa Prisma desde local con la URL de producción)

---

## Paso 10: Crear Usuario Admin

Una vez que todo esté deployado:

1. **Registrate** como participante normal
2. **Conectá a la base de datos** (desde Vercel Storage → Query)
3. **Ejecutá este SQL**:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'tu-email@ejemplo.com';
```

O creá el admin directamente:

```sql
INSERT INTO users (id, email, name, password, role, "createdAt", "updatedAt") 
VALUES (
  gen_random_uuid(), 
  'admin@sav.org.ar', 
  'Administrador', 
  '$2a$10$TuHashDePasswordAqui', 
  'ADMIN',
  NOW(),
  NOW()
);
```

*(La password tiene que estar hasheada con bcrypt)*

---

## ✅ ¡Listo!

Tu concurso de fotografía debería estar funcionando en:
`https://concurso-fotografia-sav.vercel.app`

**Próximos pasos:**
- Crear jurados desde el panel de admin
- Configurar la fase del concurso
- Compartir el link con los participantes

¿Necesitás ayuda con algún paso específico?