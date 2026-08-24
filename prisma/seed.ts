import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // Create Category
  const category = await prisma.category.upsert({
    where: { slug: 'sde-resume-race' },
    update: {},
    create: {
      slug: 'sde-resume-race',
      name: 'SDE Resume Race',
      description: 'Race to the top with your SDE resume!',
    },
  })
  console.log(`Ensured category: ${category.name}`)

  // Create demo Users and Entries
  const demoUsers = [
    {
      displayName: 'Alice (Hare)',
      deviceToken: 'demo-token-1',
      entryName: 'Alice Resume',
      college: 'MIT',
      gradYear: 2024,
      points: 150,
      resumeUrl: 'https://example.com/alice',
    },
    {
      displayName: 'Bob (Tortoise)',
      deviceToken: 'demo-token-2',
      entryName: 'Bob Resume',
      college: 'Stanford',
      gradYear: 2025,
      points: 90,
      resumeUrl: 'https://example.com/bob',
    },
    {
      displayName: 'Charlie',
      deviceToken: 'demo-token-3',
      entryName: 'Charlie Resume',
      college: 'Berkeley',
      gradYear: 2026,
      points: 20,
      resumeUrl: 'https://example.com/charlie',
    },
  ]

  for (const demo of demoUsers) {
    const user = await prisma.user.upsert({
      where: { deviceToken: demo.deviceToken },
      update: {},
      create: {
        displayName: demo.displayName,
        deviceToken: demo.deviceToken,
      },
    })
    console.log(`Ensured user: ${user.displayName}`)

    // Create entry if it doesn't exist for this user + category
    const existingEntry = await prisma.entry.findFirst({
      where: { userId: user.id, categoryId: category.id },
    })

    if (!existingEntry) {
      const entry = await prisma.entry.create({
        data: {
          userId: user.id,
          categoryId: category.id,
          name: demo.entryName,
          college: demo.college,
          gradYear: demo.gradYear,
          resumeUrl: demo.resumeUrl,
          points: demo.points,
        },
      })
      console.log(`Created entry for ${demo.displayName} with ${demo.points} points`)
      
      // Seed a single point transaction to reflect their starting points
      await prisma.pointTransaction.create({
        data: {
          entryId: entry.id,
          userId: user.id,
          amount: demo.points,
          type: 'MANUAL_ADJUST',
        }
      })
    } else {
      console.log(`Entry already exists for ${demo.displayName}`)
    }
  }

  console.log('Seeding completed successfully.')
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
