const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('amoniaco', 10)
  
  try {
    const user = await prisma.user.upsert({
      where: { email: 'valvapamela@gmail.com' },
      update: {
        role: 'ADMIN',
        password: hashedPassword,
      },
      create: {
        email: 'valvapamela@gmail.com',
        name: 'Pamela Admin',
        password: hashedPassword,
        role: 'ADMIN',
      },
    })
    
    console.log('✅ Usuario admin creado/actualizado:', user.email)
    console.log('Rol:', user.role)
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
