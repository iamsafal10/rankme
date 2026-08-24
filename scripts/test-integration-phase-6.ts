import 'dotenv/config'

async function runTest() {
  console.log('--- Phase 6 Integration Test ---')
  
  // 1. Landing Page
  console.log('\nChecking Landing Page...')
  const resLanding = await fetch('http://localhost:3000/')
  if (resLanding.status !== 200) throw new Error('Landing page failed to load')
  const landingHtml = await resLanding.text()
  if (!landingHtml.includes('The SDE Resume Race')) {
    throw new Error('Landing page missing expected content')
  }

  // 2. Identify & Submit
  console.log('\nSimulating cold visitor identity request...')
  const resId = await fetch('http://localhost:3000/api/users/identify', { method: 'POST' })
  const cookieHeader = resId.headers.get('set-cookie')
  const cookieString = (cookieHeader?.match(/(rankme_device_token=[^;]+)/) || [])[1] || ''

  console.log('Checking Submit Page...')
  const resSubmitPage = await fetch('http://localhost:3000/submit', { headers: { 'Cookie': cookieString }})
  if (resSubmitPage.status !== 200) throw new Error('Submit page failed to load')

  console.log('Submitting entry...')
  const payload = {
    name: 'Phase 6 UI Tester',
    resumeUrl: 'https://example.com/p6',
    college: 'UI Univ',
    gradYear: '2028'
  }
  const resSubmit = await fetch('http://localhost:3000/api/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieString },
    body: JSON.stringify(payload)
  })
  const submitData = await resSubmit.json()
  if (resSubmit.status !== 201) throw new Error('Submit API failed')

  // 3. Leaderboard Page & API
  console.log('\nChecking Leaderboard Page...')
  const resLeaderboardPage = await fetch('http://localhost:3000/leaderboard/sde-resume-race')
  if (resLeaderboardPage.status !== 200) throw new Error('Leaderboard page failed to load')

  console.log('Fetching Leaderboard API...')
  const resLeaderboard = await fetch('http://localhost:3000/api/entries?category=sde-resume-race')
  const leaderboard = await resLeaderboard.json()
  const entry = leaderboard.find((e: any) => e.id === submitData.id)
  if (!entry) throw new Error('Entry missing from leaderboard API')

  // 4. Outbid
  console.log('\nTesting outbid functionality...')
  const resOutbid = await fetch(`http://localhost:3000/api/entries/${submitData.id}/outbid`, {
    method: 'POST',
    headers: { 'Cookie': cookieString }
  })
  if (resOutbid.status !== 200) throw new Error('Outbid API failed')

  console.log('\n✅ Phase 6 integration test PASSED.')
}

runTest().catch(e => {
  console.error(e)
  process.exit(1)
})
