import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function runTest() {
  console.log('--- Phase 2 Integration Test ---')
  
  // 1. Initial State
  const initialUserCount = await prisma.user.count()
  console.log(`Initial DB User count: ${initialUserCount} (should include Phase 1 seeded users)`)

  // 2. First request (cold)
  console.log('\nSending cold request (no cookie)...')
  const res1 = await fetch('http://localhost:3000/api/users/identify', { method: 'POST' })
  const data1 = await res1.json()
  const cookieHeader = res1.headers.get('set-cookie')

  console.log(`Response 1: HTTP ${res1.status}, data:`, data1)
  
  if (!cookieHeader) {
    throw new Error('No set-cookie header received on cold request!')
  }

  // Extract just the cookie value for the next request
  const cookieMatch = cookieHeader.match(/(rankme_device_token=[^;]+)/)
  const cookieString = cookieMatch ? cookieMatch[1] : ''
  console.log(`Received Cookie: ${cookieString}`)

  const midUserCount = await prisma.user.count()
  console.log(`User count after cold request: ${midUserCount} (should be +1)`)

  if (midUserCount !== initialUserCount + 1) {
    throw new Error('User was not persisted properly.')
  }

  // 3. Second request (returning visitor)
  console.log(`\nSending returning request with cookie: ${cookieString}...`)
  const res2 = await fetch('http://localhost:3000/api/users/identify', { 
    method: 'POST',
    headers: { 'Cookie': cookieString }
  })
  const data2 = await res2.json()
  
  console.log(`Response 2: HTTP ${res2.status}, data:`, data2)
  
  if (data1.id !== data2.id || data1.deviceToken !== data2.deviceToken) {
    throw new Error('Returning visitor did not get the same identity back!')
  }

  const finalUserCount = await prisma.user.count()
  console.log(`User count after returning request: ${finalUserCount} (should be unchanged)`)

  if (finalUserCount !== midUserCount) {
    throw new Error('A duplicate user was created incorrectly on the returning request!')
  }

  // 4. Verify Phase 1 data untouched
  const alice = await prisma.user.findFirst({ where: { displayName: 'Alice (Hare)' }})
  if (!alice) {
    throw new Error('Phase 1 seed data (Alice) is missing!')
  }

  console.log('\n✅ Phase 1 seed data is intact.')
  console.log('✅ Identity integration test PASSED.')
}

runTest()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect()
    pool.end()
  })
