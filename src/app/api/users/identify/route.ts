import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDeviceToken, setDeviceToken } from '@/lib/identity'
import { v4 as uuidv4 } from 'uuid'

export async function POST() {
  try {
    const existingToken = await getDeviceToken()
    
    if (existingToken) {
      const existingUser = await prisma.user.findUnique({
        where: { deviceToken: existingToken }
      })
      if (existingUser) {
        return NextResponse.json({ id: existingUser.id, deviceToken: existingUser.deviceToken, isNew: false })
      }
    }

    // No valid user found or no cookie, create one
    const newToken = uuidv4()
    // Generate a fun random name for anonymous users
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    
    const newUser = await prisma.user.create({
      data: {
        deviceToken: newToken,
        displayName: `Racer ${randomSuffix}`,
      }
    })

    // Set the cookie via the helper
    await setDeviceToken(newToken)

    return NextResponse.json({ id: newUser.id, deviceToken: newUser.deviceToken, isNew: true })
  } catch (error) {
    console.error('Error in identify:', error)
    return NextResponse.json({ error: 'Failed to identify user' }, { status: 500 })
  }
}
