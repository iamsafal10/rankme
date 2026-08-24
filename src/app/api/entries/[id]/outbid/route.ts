import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDeviceToken } from '@/lib/identity'
import { awardPoints } from '@/lib/points'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const entryId = resolvedParams.id

    const deviceToken = await getDeviceToken()
    if (!deviceToken) {
      return NextResponse.json({ error: 'Unauthorized: No identity found' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { deviceToken }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid identity' }, { status: 401 })
    }

    // Attempt to outbid
    const result = await awardPoints(entryId, user.id, 10, 'DEMO_OUTBID')

    return NextResponse.json({ success: true, entry: result.updatedEntry }, { status: 200 })
  } catch (error: any) {
    console.error('Error outbidding entry:', error)
    if (error.code === 'P2025') {
      // Prisma record not found error
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
