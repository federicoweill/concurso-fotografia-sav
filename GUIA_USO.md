# Guía de Uso - Concurso de Fotografía SAV

## 📋 Resumen de Roles

| Rol | Permisos |
|-----|----------|
| **Administrador** | Gestiona usuarios, fotos, configuración y fases del concurso |
| **Jurado** | Vota fotografías anónimamente (1 voto por jurado) |
| **Participante** | Sube 1 fotografía durante la fase de inscripción |

---

## 👨‍💼 GUÍA PARA ADMINISTRADORES

### 1. Primer Acceso
1. **Registrate** en la página principal como cualquier usuario
2. **Contactá al desarrollador** para que cambie tu rol a "ADMIN" en la base de datos
3. **Iniciá sesión** - serás redirigido automáticamente al panel de administración

### 2. Panel de Administración (/admin)

#### 📊 Pestaña "Usuarios"
- **Ver todos los usuarios**: Participantes, jurados y administradores
- **Crear nuevos usuarios**: 
  - Hacé clic en "+ Crear Usuario (Jurado/Admin)"
  - Completá nombre, email, contraseña y rol
  - Ideal para crear jurados sin que se registren ellos mismos
- **Editar usuarios**: Cambiar nombre, email o rol
- **Eliminar usuarios**: ⚠️ Esto también elimina sus fotos

#### 📸 Pestaña "Fotografías"
- **Ver todas las fotos** con títulos y votos
- **Eliminar fotos** si son inapropiadas
- **Ver autor**: Solo los admins ven quién subió cada foto

#### 🏆 Pestaña "Resultados"
- Muestra el **Top 3** de fotos más votadas
- Solo visible cuando la fase es "RESULTS"
- Revela los nombres de los ganadores

#### ⚙️ Pestaña "Configuración"
**Control de Fases del Concurso:**

1. **REGISTRATION (Inscripción)**
   - Los participantes pueden registrarse y subir fotos
   - Los jurados no pueden votar todavía
   - Usar durante el período de inscripción

2. **JUDGING (Evaluación)**
   - Los participantes están bloqueados (no pueden subir ni modificar)
   - Los jurados pueden ver fotos anónimamente y votar
   - Cada jurado tiene **1 voto** (puede cambiarlo durante esta fase)

3. **RESULTS (Resultados)**
   - Muestra los ganadores públicamente
   - Nadie puede votar ni subir fotos
   - Fase de solo lectura

**Para cambiar de fase:**
1. Andá a "Configuración"
2. Seleccioná la fase deseada
3. Guardá cambios

---

## ⚖️ GUÍA PARA JURADOS

### 1. Acceder al Sistema
1. **Obtené tus credenciales** del administrador (email y contraseña)
2. **Iniciá sesión** en la página principal
3. **Serás redirigido** automáticamente al panel de jurado

### 2. Panel de Jurado (/judge)

**IMPORTANTE:** Durante la evaluación, las fotos se muestran **ANÓNIMAMENTE** (sin nombre del autor).

#### Durante la fase JUDGING:
- **Ver todas las fotografías** en una grilla
- **Cada foto muestra**: Título (si el participante lo agregó) y número
- **Hacé clic en una foto** para verla en tamaño completo
- **Votar**: Hacé clic en "Votar" debajo de la foto que prefieras

#### Reglas de Votación:
- ✅ **1 voto por jurado** (puedes cambiarlo durante la fase JUDGING)
- ✅ La foto que elegís mostrará "TU VOTO"
- ✅ Podés cambiar tu voto: "Cambiar voto" → seleccioná otra foto
- ❌ No podés votar fuera de la fase JUDGING

#### Consejos:
- Hacé clic en las fotos para verlas en tamaño completo
- Evaluá la calidad técnica y creatividad
- Recordá que es anónimo - ¡no sabés quién tomó cada foto!

---

## 📷 GUÍA PARA PARTICIPANTES

### 1. Registro
1. **Andá a la página principal**
2. **Hacé clic en "¿No tienes cuenta? Regístrate"**
3. **Completá tus datos:**
   - Nombre completo
   - Email válido
   - Contraseña (mínimo 6 caracteres)
4. **Registrate**

### 2. Subir Fotografía

**IMPORTANTE:** Solo podés subir fotos durante la fase "REGISTRATION".

#### Proceso:
1. **Iniciá sesión** - serás redirigido a tu panel
2. **Hacé clic en "Seleccionar foto"**
3. **Elegí tu archivo** (JPG, PNG o WebP, máximo 10MB)
4. **Agregá un título** descriptivo para tu fotografía
5. **Hacé clic en "Subir foto"**

#### Reglas:
- ✅ **1 foto por participante**
- ✅ Puedes eliminar y subir otra durante REGISTRATION
- ❌ No podés subir fotos fuera de la fase REGISTRATION
- ❌ No podés subir más de 1 foto (debes eliminar la anterior primero)

### 3. Ver tu Foto
- En tu panel verás la foto que subiste con su título
- Podés eliminarla y subir otra (solo durante REGISTRATION)

### 4. Recuperar Contraseña
Si olvidás tu contraseña:
1. **Andá a Login**
2. **Hacé clic en "¿Olvidaste tu contraseña?"**
3. **Ingresá tu email**
4. **Recibirás un enlace** para crear nueva contraseña (válido por 1 hora)
5. **Seguí el enlace** y creá tu nueva contraseña

---

## 🔄 Flujo del Concurso

```
FASE 1: REGISTRATION (Inscripción)
├── Participantes se registran
├── Participantes suben 1 foto cada uno
└── Jurados NO pueden votar todavía
         ↓
FASE 2: JUDGING (Evaluación) 
├── Admin cambia a esta fase
├── Participantes BLOQUEADOS
├── Jurados votan anónimamente (1 voto cada uno)
└── Pueden cambiar su voto durante esta fase
         ↓
FASE 3: RESULTS (Resultados)
├── Admin cambia a esta fase
├── Se muestran ganadores (Top 3)
├── Todos ven los resultados
└── Concurso finalizado
```

---

## ⚠️ Notas Importantes

### Para Todos:
- **Rate limiting**: El sistema limita intentos de login (5 por minuto) y registro (3 por hora) para seguridad
- **Contraseñas**: Se almacenan encriptadas, nadie puede verlas
- **Fotos**: Se almacenan de forma segura en Vercel Blob

### Para Administradores:
- **Backup**: La base de datos PostgreSQL tiene backups automáticos
- **Seguridad**: No compartas credenciales de admin
- **Cambio de fases**: Avisá a participantes y jurados antes de cambiar fases

### Para Jurados:
- **Imparcialidad**: No intentes averiguar quién subió cada foto
- **1 voto**: Solo podés elegir una fotografía ganadora
- **Anonimato**: El sistema oculta completamente la identidad de los fotógrafos

---

## 🆘 Solución de Problemas

### No puedo iniciar sesión
- Verificá que estés usando el email correcto
- Usá "¿Olvidaste tu contraseña?" si la olvidaste
- Esperá 1 minuto si intentaste muchas veces (rate limiting)

### No puedo subir foto
- Verificá que estés en fase REGISTRATION
- La foto debe ser JPG, PNG o WebP
- Máximo 10MB de tamaño
- Si ya subiste una, eliminala primero

### No puedo votar
- Verificá que seas JURADO (no participante)
- Verificá que estemos en fase JUDGING
- Solo 1 voto por jurado (podés cambiarlo)

### Error 500 / Error del servidor
- Refresca la página
- Si persiste, contactá al administrador

---

## 📞 Soporte

Para problemas técnicos o consultas:
- **Email del concurso**: [agregar email de soporte]
- **Admin del sistema**: [agregar contacto del admin]

---

**¡Buena suerte a todos los participantes! 📸**
