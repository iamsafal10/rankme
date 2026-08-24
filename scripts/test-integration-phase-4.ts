import 'dotenv/config'

async function runTest() {
  console.log('--- Phase 4 Integration Test ---')
  
  // 1. Get identity (Simulate visitor loading the site)
  console.log('\nSimulating cold visitor identity request...')
  const resId = await fetch('http://localhost:3000/api/users/identify', { method: 'POST' })
  const cookieHeader = resId.headers.get('set-cookie')
  
  if (!cookieHeader) throw new Error('Failed to get cookie from identify route')
  
  const cookieMatch = cookieHeader.match(/(rankme_device_token=[^;]+)/)
  const cookieString = cookieMatch ? cookieMatch[1] : ''
  console.log(`Received Cookie: ${cookieString}`)

  // 2. Submit Entry
  console.log('\nSubmitting entry for new visitor...')
  const payload = {
    name: 'Integration Test Racer',
    resumeUrl: 'https://example.com/resume.pdf',
    college: 'Test University',
    gradYear: '2026'
  }

  const resSubmit = await fetch('http://localhost:3000/api/entries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieString
    },
    body: JSON.stringify(payload)
  })

  const submitData = await resSubmit.json()
  
  if (resSubmit.status !== 201) {
    throw new Error(`Failed to submit entry: ${JSON.stringify(submitData)}`)
  }
  console.log('Entry submitted successfully:', submitData.id)

  // 3. Fetch Leaderboard
  console.log('\nFetching leaderboard to confirm visibility...')
  const resLeaderboard = await fetch('http://localhost:3000/api/entries?category=sde-resume-race')
  const leaderboard = await resLeaderboard.json()

  // 4. Verify Leaderboard
  const newEntry = leaderboard.find((e: any) => e.id === submitData.id)
  
  if (!newEntry) {
    throw new Error('New entry was not found in the leaderboard!')
  }
  
  if (newEntry.points !== 0) {
    throw new Error(`Expected new entry to have 0 points, but it had ${newEntry.points}`)
  }

  // Find Alice to ensure Phase 1 is untouched
  const alice = leaderboard.find((e: any) => e.name === 'Alice Resume')
  if (!alice || alice.points !== 150) {
    throw new Error('Phase 1 seed data (Alice) has been altered or is missing!')
  }

  console.log('\n✅ Phase 4 integration test PASSED.')
}

runTest().catch(e => {
  console.error(e)
  process.exit(1)
})
