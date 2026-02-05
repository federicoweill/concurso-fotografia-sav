import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create default admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@sav.org.ar'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    
    await prisma.user.create({
      data: {
        name: 'Administrador',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
      },
    })

    console.log(`✅ Admin user created: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
  } else {
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`)
  }

  // Create default contest settings
  const existingSettings = await prisma.contestSettings.findFirst()

  if (!existingSettings) {
    await prisma.contestSettings.create({
      data: {
        phase: 'REGISTRATION',
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedFileTypes: 'image/jpeg,image/png,image/webp',
      },
    })

    console.log('✅ Default contest settings created')
  } else {
    console.log('ℹ️  Contest settings already exist')
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })