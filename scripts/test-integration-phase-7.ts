import 'dotenv/config'

async function runTest() {
  console.log('--- Phase 7 QA Master Integration Test ---')
  
  // 1. Visit landing
  console.log('\n[1] Visiting landing page...')
  const resLanding = await fetch('http://localhost:3000/')
  if (resLanding.status !== 200) throw new Error('Landing page failed to load')

  // 2. Identify
  console.log('\n[2] Triggering silent identity creation...')
  const resId = await fetch('http://localhost:3000/api/users/identify', { method: 'POST' })
  const cookieHeader = resId.headers.get('set-cookie')
  const cookieString = (cookieHeader?.match(/(rankme_device_token=[^;]+)/) || [])[1] || ''
  if (!cookieString) throw new Error('Failed to create identity cookie')

  // 3. Submit Invalid payload (should fail)
  console.log('\n[3] Testing API validation with malformed payload...')
  const badPayload = { name: 'Bad', resumeUrl: 'not-a-url', college: 'UI Univ', gradYear: 'invalid' }
  const resBadSubmit = await fetch('http://localhost:3000/api/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieString },
    body: JSON.stringify(badPayload)
  })
  if (resBadSubmit.status !== 400) throw new Error(`Expected 400 on bad submit, got ${resBadSubmit.status}`)

  // 4. Submit Valid Entry
  console.log('\n[4] Submitting valid entry...')
  const payload = {
    name: 'QA Master Tester',
    resumeUrl: 'https://example.com/qa',
    college: 'QA Univ',
    gradYear: '2028'
  }
  const resSubmit = await fetch('http://localhost:3000/api/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieString },
    body: JSON.stringify(payload)
  })
  const submitData = await resSubmit.json()
  if (resSubmit.status !== 201) throw new Error('Valid submit API failed')

  // 5. Leaderboard fetch (ensure it's at 0 points)
  console.log('\n[5] Fetching Leaderboard API to verify 0 points...')
  let resLeaderboard = await fetch('http://localhost:3000/api/entries?category=sde-resume-race')
  let leaderboard = await resLeaderboard.json()
  let entry = leaderboard.find((e: any) => e.id === submitData.id)
  if (!entry || entry.points !== 0) throw new Error('Entry missing or not starting at 0 points')

  // 6. Outbid 3 times
  console.log('\n[6] Outbidding 3 times (+30 pts)...')
  for (let i = 0; i < 3; i++) {
    const resOutbid = await fetch(`http://localhost:3000/api/entries/${submitData.id}/outbid`, {
      method: 'POST',
      headers: { 'Cookie': cookieString }
    })
    if (resOutbid.status !== 200) throw new Error(`Outbid API failed on attempt ${i + 1}`)
  }

  // 7. Leaderboard fetch again to verify points and sort
  console.log('\n[7] Fetching Leaderboard API to verify 30 points...')
  resLeaderboard = await fetch('http://localhost:3000/api/entries?category=sde-resume-race')
  leaderboard = await resLeaderboard.json()
  entry = leaderboard.find((e: any) => e.id === submitData.id)
  
  if (!entry || entry.points !== 30) {
    throw new Error(`Expected QA Entry to have 30 points, found ${entry?.points}`)
  }

  // Double check Alice is still intact
  const alice = leaderboard.find((e: any) => e.name === 'Alice Resume')
  if (!alice || alice.points !== 150) {
    throw new Error('Phase 1 seed data (Alice) was corrupted during test.')
  }

  console.log('\n✅ Phase 7 QA Master Integration Test PASSED.')
}

runTest().catch(e => {
  console.error(e)
  process.exit(1)
})
