import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function runTest() {
  console.log('--- Phase 5 Integration Test ---')
  
  // 1. Get identity
  console.log('\nGetting identity...')
  const resId = await fetch('http://localhost:3000/api/users/identify', { method: 'POST' })
  const cookieHeader = resId.headers.get('set-cookie')
  const cookieMatch = cookieHeader?.match(/(rankme_device_token=[^;]+)/)
  const cookieString = cookieMatch ? cookieMatch[1] : ''

  // 2. Submit Entry
  console.log('\nSubmitting entry...')
  const payload = {
    name: 'Outbid Tester',
    resumeUrl: 'https://example.com',
    college: 'Outbid Univ',
    gradYear: '2027'
  }
  const resSubmit = await fetch('http://localhost:3000/api/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieString },
    body: JSON.stringify(payload)
  })
  const submitData = await resSubmit.json()
  const entryId = submitData.id

  // 3. Outbid 3 times
  console.log('\nOutbidding entry 3 times...')
  for (let i = 0; i < 3; i++) {
    const resOutbid = await fetch(`http://localhost:3000/api/entries/${entryId}/outbid`, {
      method: 'POST',
      headers: { 'Cookie': cookieString }
    })
    if (resOutbid.status !== 200) {
      throw new Error(`Outbid failed: ${resOutbid.status}`)
    }
  }

  // 4. Fetch Leaderboard and verify points
  console.log('\nFetching leaderboard to verify points and sorting...')
  const resLeaderboard = await fetch('http://localhost:3000/api/entries?category=sde-resume-race')
  const leaderboard = await resLeaderboard.json()

  const updatedEntry = leaderboard.find((e: any) => e.id === entryId)
  if (!updatedEntry || updatedEntry.points !== 30) {
    throw new Error(`Expected entry to have 30 points, but found ${updatedEntry?.points}`)
  }

  // Verify Alice is still at 150 points
  const alice = leaderboard.find((e: any) => e.name === 'Alice Resume')
  if (!alice || alice.points !== 150) {
    throw new Error('Phase 1 seed data (Alice) has been altered or is missing!')
  }

  // 5. Verify transactions in DB directly
  console.log('\nVerifying transactions in database...')
  const txs = await prisma.pointTransaction.findMany({
    where: { entryId }
  })
  if (txs.length !== 3) {
    throw new Error(`Expected exactly 3 point transactions, found ${txs.length}`)
  }
  if (txs[0].type !== 'DEMO_OUTBID') {
    throw new Error(`Expected transaction type DEMO_OUTBID, found ${txs[0].type}`)
  }

  console.log('\n✅ Phase 5 integration test PASSED.')
}

runTest()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect()
    pool.end()
  })
