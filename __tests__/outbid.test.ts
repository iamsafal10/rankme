import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/entries/[id]/outbid/route'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
  }
}))
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/identity', () => ({
  getDeviceToken: vi.fn(),
}))
import { getDeviceToken } from '@/lib/identity'

vi.mock('@/lib/points', () => ({
  awardPoints: vi.fn(),
}))
import { awardPoints } from '@/lib/points'

describe('POST /api/entries/[id]/outbid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects if no cookie is present', async () => {
    // @ts-ignore
    getDeviceToken.mockResolvedValue(undefined)
    
    const req = new Request('http://localhost:3000/api/entries/1/outbid', { method: 'POST' })
    const res = await POST(req, { params: Promise.resolve({ id: '1' }) })
    
    expect(res.status).toBe(401)
  })

  it('awards points and returns updated entry', async () => {
    // @ts-ignore
    getDeviceToken.mockResolvedValue('token')
    // @ts-ignore
    prisma.user.findUnique.mockResolvedValue({ id: 'u-1' })
    // @ts-ignore
    awardPoints.mockResolvedValue({ updatedEntry: { id: '1', points: 10 } })
    
    const req = new Request('http://localhost:3000/api/entries/1/outbid', { method: 'POST' })
    const res = await POST(req, { params: Promise.resolve({ id: '1' }) })
    
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.entry.points).toBe(10)
    expect(awardPoints).toHaveBeenCalledWith('1', 'u-1', 10, 'DEMO_OUTBID')
  })
})
