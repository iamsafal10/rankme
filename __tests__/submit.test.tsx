import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { SubmitForm } from '@/components/SubmitForm'
import { POST } from '@/app/api/entries/route'

// Mock the router
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Mock fetch for the component tests
global.fetch = vi.fn()

// Mock prisma and identity for API tests
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    category: { findUnique: vi.fn() },
    entry: { findFirst: vi.fn(), create: vi.fn() },
  },
}))
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/identity', () => ({
  getDeviceToken: vi.fn(),
}))
import { getDeviceToken } from '@/lib/identity'

describe('SubmitForm Component', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    render(<SubmitForm />)
    expect(screen.getByLabelText(/Display Name/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /Submit Resume/i })).toBeDefined()
  })

  it('shows error on invalid URL', async () => {
    render(<SubmitForm />)
    
    fireEvent.change(screen.getByLabelText(/Display Name/i), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText(/Resume URL/i), { target: { value: 'not-a-url' } })
    fireEvent.change(screen.getByLabelText(/College/i), { target: { value: 'MIT' } })
    fireEvent.change(screen.getByLabelText(/Graduation Year/i), { target: { value: '2025' } })
    
    fireEvent.submit(screen.getByRole('button', { name: /Submit Resume/i }).closest('form')!)
    
    expect(await screen.findByText('Please provide a valid URL for your resume.')).toBeDefined()
    expect(global.fetch).not.toHaveBeenCalled()
  })
})

describe('POST /api/entries logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects if no deviceToken', async () => {
    // @ts-ignore
    getDeviceToken.mockResolvedValue(undefined)

    const req = new Request('http://localhost:3000/api/entries', { method: 'POST' })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('rejects on missing fields', async () => {
    // @ts-ignore
    getDeviceToken.mockResolvedValue('token-123')
    // @ts-ignore
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1' })

    const req = new Request('http://localhost:3000/api/entries', { 
      method: 'POST',
      body: JSON.stringify({ name: 'John' }) // missing other fields
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Missing required fields')
  })

  it('creates entry on valid payload', async () => {
    // @ts-ignore
    getDeviceToken.mockResolvedValue('token-123')
    // @ts-ignore
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1' })
    // @ts-ignore
    prisma.category.findUnique.mockResolvedValue({ id: 'cat-1' })
    // @ts-ignore
    prisma.entry.findFirst.mockResolvedValue(null)
    // @ts-ignore
    prisma.entry.create.mockResolvedValue({ id: 'entry-1', points: 0 })

    const req = new Request('http://localhost:3000/api/entries', { 
      method: 'POST',
      body: JSON.stringify({ name: 'John', resumeUrl: 'https://j.com', college: 'MIT', gradYear: '2025' })
    })
    
    const res = await POST(req)
    expect(res.status).toBe(201)
    
    expect(prisma.entry.create).toHaveBeenCalledWith({
      data: {
        name: 'John',
        resumeUrl: 'https://j.com',
        college: 'MIT',
        gradYear: 2025,
        points: 0,
        userId: 'user-1',
        categoryId: 'cat-1'
      }
    })
  })
})
