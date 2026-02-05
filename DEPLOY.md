# Guía de Despliegue en Vercel

## Paso 1: Preparar el Proyecto

1. Asegúrate de tener todas las dependencias instaladas:
```bash
npm install
```

2. Genera el cliente de Prisma:
```bash
npx prisma generate
```

## Paso 2: Configurar Base de Datos en Vercel

### Opción A: Vercel Postgres (Recomendado)
1. Ve a tu dashboard de Vercel
2. Selecciona tu proyecto
3. Ve a la pestaña "Storage"
4. Crea una nueva base de datos Postgres
5. Conecta la base de datos a tu proyecto
6. Vercel automáticamente agregará las variables de entorno:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`

### Opción B: Base de Datos Externa (Supabase, Railway, etc.)
1. Obtén la URL de conexión de tu proveedor
2. Configura la variable de entorno `DATABASE_URL` en Vercel

## Paso 3: Configurar Variables de Entorno

En tu dashboard de Vercel, ve a "Settings" > "Environment Variables" y configura:

```
# Base de datos (automático si usas Vercel Postgres)
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_URL=https://tu-dominio.vercel.app
NEXTAUTH_SECRET=tu-secreto-super-seguro-genera-con-openssl-rand-base64-32

# Vercel Blob (para almacenar fotos)
BLOB_READ_WRITE_TOKEN=tu-token-de-vercel-blob
```

### Generar NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### Obtener BLOB_READ_WRITE_TOKEN:
1. Ve a tu dashboard de Vercel
2. Ve a "Storage" > "Blob"
3. Crea un nuevo store de Blob
4. Conecta a tu proyecto
5. El token se agregará automáticamente

## Paso 4: Desplegar

### Opción A: Desde la CLI de Vercel
```bash
# Instalar Vercel CLI si no lo tienes
npm i -g vercel

# Login
vercel login

# Desplegar
vercel

# Para producción
vercel --prod
```

### Opción B: Desde GitHub
1. Sube tu código a GitHub
2. Conecta tu repositorio en Vercel
3. Configura las variables de entorno
4. Haz deploy

## Paso 5: Migrar la Base de Datos

Después del primer deploy, ejecuta las migraciones:

```bash
# Conectar a tu base de datos y ejecutar migraciones
npx prisma migrate deploy
```

O ejecuta desde Vercel CLI:
```bash
vercel env pull .env.local
npx prisma migrate deploy
```

## Paso 6: Crear Usuario Admin

### Opción A: Seed Script (desarrollo local)
```bash
# Configura ADMIN_EMAIL y ADMIN_PASSWORD en .env
ADMIN_EMAIL=admin@sav.org.ar
ADMIN_PASSWORD=tu-password-segura

# Ejecuta el seed
npx prisma db seed
```

### Opción B: Crear manualmente (producción)
1. Regístrate como participante normal
2. Conecta a la base de datos
3. Actualiza el rol del usuario a ADMIN:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'tu-email@sav.org.ar';
```

## Paso 7: Configurar el Concurso

1. Inicia sesión como administrador
2. Ve al panel de administración
3. Configura la fase del concurso:
   - **REGISTRATION**: Los participantes pueden registrarse y subir fotos
   - **JUDGING**: Los jurados pueden ver y votar fotos anónimamente
   - **RESULTS**: Se muestran los resultados públicamente

## Estructura de URLs

- `/login` - Iniciar sesión
- `/register` - Registro de participantes
- `/contestant` - Panel del participante (subir foto)
- `/judge` - Panel del jurado (votar)
- `/admin` - Panel de administración

## Comandos Útiles

```bash
# Desarrollo local
npm run dev

# Generar Prisma Client
npm run db:generate

# Migraciones en desarrollo
npm run db:migrate

# Studio de Prisma
npm run db:studio

# Build para producción
npm run build
```

## Solución de Problemas

### Error: "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### Error de conexión a base de datos
Verifica que `DATABASE_URL` esté configurado correctamente en Vercel.

### Fotos no se cargan
Verifica que `BLOB_READ_WRITE_TOKEN` esté configurado y que hayas creado un Blob Store en Vercel.

## Soporte

Para más información:
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vercel Documentation](https://vercel.com/docs)