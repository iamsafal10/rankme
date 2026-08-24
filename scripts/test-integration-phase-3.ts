import 'dotenv/config'

async function runTest() {
  console.log('--- Phase 3 Integration Test ---')
  
  // 1. Hit the leaderboard read API for seeded category
  console.log('\nFetching leaderboard for "sde-resume-race"...')
  const res = await fetch('http://localhost:3000/api/entries?category=sde-resume-race')
  const data = await res.json()
  
  console.log(`Response HTTP ${res.status}`)
  
  if (!Array.isArray(data)) {
    throw new Error('Expected an array of entries')
  }
  
  if (data.length !== 3) {
    throw new Error(`Expected exactly 3 seeded entries, found ${data.length}`)
  }

  // 2. Confirm order is correct (points descending)
  console.log('\nVerifying sort order...')
  for (let i = 0; i < data.length - 1; i++) {
    if (data[i].points < data[i + 1].points) {
      throw new Error(`Ordering failed! Index ${i} has ${data[i].points} pts, Index ${i+1} has ${data[i+1].points} pts.`)
    }
  }

  console.log(`Top racer is ${data[0].name} with ${data[0].points} points.`)

  // 3. Ensure identity flow doesn't interfere
  // Let's check if the API returns a cookie when none is provided (should NOT, as this is a read API without IdentifyVisitor)
  // Wait, IdentifyVisitor is on the layout, so hitting the API route directly doesn't trigger layout.tsx!
  // But let's check it anyway.
  const cookieHeader = res.headers.get('set-cookie')
  if (cookieHeader) {
    console.warn('Warning: GET /api/entries set a cookie unexpectedly.')
  }

  // 4. Test missing category
  console.log('\nFetching missing category...')
  const missingRes = await fetch('http://localhost:3000/api/entries?category=fake-missing')
  expectStatus(missingRes.status, 404)

  console.log('\n✅ Phase 3 integration test PASSED.')
}

function expectStatus(actual: number, expected: number) {
  if (actual !== expected) {
    throw new Error(`Expected HTTP ${expected} but got ${actual}`)
  }
}

runTest().catch(e => {
  console.error(e)
  process.exit(1)
})
