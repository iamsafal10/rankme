import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RankBadge } from '@/components/RankBadge'
import { GET } from '@/app/api/entries/route'

// Mock prisma
vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      category: {
        findUnique: vi.fn(),
      },
      entry: {
        findMany: vi.fn(),
      },
    },
  }
})

import { prisma } from '@/lib/prisma'

describe('RankBadge Component', () => {
  it('renders gold medal for rank 1', () => {
    render(<RankBadge rank={1} />)
    expect(screen.getByTitle('Rank 1')).toBeDefined()
    expect(screen.getByText('🥇')).toBeDefined()
  })

  it('renders silver medal for rank 2', () => {
    render(<RankBadge rank={2} />)
    expect(screen.getByTitle('Rank 2')).toBeDefined()
    expect(screen.getByText('🥈')).toBeDefined()
  })

  it('renders bronze medal for rank 3', () => {
    render(<RankBadge rank={3} />)
    expect(screen.getByTitle('Rank 3')).toBeDefined()
    expect(screen.getByText('🥉')).toBeDefined()
  })

  it('renders plain number for rank 4+', () => {
    render(<RankBadge rank={4} />)
    expect(screen.getByText('4')).toBeDefined()
  })
})

describe('GET /api/entries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 if category is missing', async () => {
    const req = new Request('http://localhost:3000/api/entries')
    const res = await GET(req)
    
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Category parameter is required')
  })

  it('returns 404 if category is unknown', async () => {
    // @ts-ignore
    prisma.category.findUnique.mockResolvedValue(null)

    const req = new Request('http://localhost:3000/api/entries?category=unknown-cat')
    const res = await GET(req)
    
    expect(res.status).toBe(404)
    const data = await res.json()
    expect(data.error).toBe('Category not found')
  })

  it('returns entries ordered by points', async () => {
    const mockCategory = { id: 'cat-123', slug: 'sde-resume-race' }
    const mockEntries = [
      { id: '1', name: 'Alice', points: 150 },
      { id: '2', name: 'Bob', points: 90 },
    ]

    // @ts-ignore
    prisma.category.findUnique.mockResolvedValue(mockCategory)
    // @ts-ignore
    prisma.entry.findMany.mockResolvedValue(mockEntries)

    const req = new Request('http://localhost:3000/api/entries?category=sde-resume-race')
    const res = await GET(req)
    
    expect(res.status).toBe(200)
    const data = await res.json()
    
    expect(data).toHaveLength(2)
    expect(data[0].name).toBe('Alice')
    
    // Check if prisma was called with correct orderBy
    expect(prisma.entry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { categoryId: 'cat-123' },
        orderBy: { points: 'desc' },
      })
    )
  })
})
