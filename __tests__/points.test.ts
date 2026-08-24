import { describe, it, expect, vi, beforeEach } from 'vitest'
import { awardPoints } from '@/lib/points'

vi.mock('@/lib/prisma', () => {
  const mockTransaction = vi.fn(async (callback) => {
    return callback({
      pointTransaction: { create: vi.fn().mockResolvedValue({ id: 'tx-1' }) },
      entry: { update: vi.fn().mockResolvedValue({ id: 'entry-1', points: 10 }) }
    })
  })
  
  return {
    prisma: {
      $transaction: mockTransaction
    }
  }
})

import { prisma } from '@/lib/prisma'

describe('awardPoints Helper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects negative or zero amounts', async () => {
    await expect(awardPoints('e-1', 'u-1', 0, 'TEST')).rejects.toThrow('Amount must be greater than zero')
    await expect(awardPoints('e-1', 'u-1', -10, 'TEST')).rejects.toThrow('Amount must be greater than zero')
  })

  it('calls prisma.$transaction and executes atomicity', async () => {
    const result = await awardPoints('e-1', 'u-1', 10, 'DEMO_OUTBID')
    
    expect(prisma.$transaction).toHaveBeenCalled()
    expect(result.transaction.id).toBe('tx-1')
    expect(result.updatedEntry.points).toBe(10)
  })
})
