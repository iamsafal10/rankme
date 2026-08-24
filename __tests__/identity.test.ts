import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getDeviceToken, setDeviceToken, DEVICE_TOKEN_COOKIE } from '@/lib/identity'
import { POST } from '@/app/api/users/identify/route'
import { prisma } from '@/lib/prisma'

// Mock next/headers
vi.mock('next/headers', () => {
  const mockCookieStore = {
    get: vi.fn(),
    set: vi.fn(),
  }
  return {
    cookies: vi.fn(async () => mockCookieStore),
  }
})

describe('Identity Cookie Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('reads undefined when cookie is missing', async () => {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    // @ts-ignore
    cookieStore.get.mockReturnValue(undefined)

    const token = await getDeviceToken()
    expect(token).toBeUndefined()
  })

  it('reads token when cookie is present', async () => {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    // @ts-ignore
    cookieStore.get.mockReturnValue({ value: 'test-token' })

    const token = await getDeviceToken()
    expect(token).toBe('test-token')
  })

  it('sets token correctly', async () => {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()

    await setDeviceToken('new-token')
    
    expect(cookieStore.set).toHaveBeenCalledWith(
      DEVICE_TOKEN_COOKIE,
      'new-token',
      expect.objectContaining({ httpOnly: true, path: '/' })
    )
  })
})

describe('POST /api/users/identify logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a new user when no cookie is present', async () => {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    // @ts-ignore
    cookieStore.get.mockReturnValue(undefined)

    const res = await POST()
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.isNew).toBe(true)
    expect(data.id).toBeDefined()
    expect(data.deviceToken).toBeDefined()
    
    // verify it was saved in DB
    const userInDb = await prisma.user.findUnique({ where: { id: data.id } })
    expect(userInDb).toBeDefined()
    expect(userInDb?.deviceToken).toBe(data.deviceToken)
    expect(userInDb?.displayName).toMatch(/Racer \d{4}/)
  })

  it('fetches existing user when valid cookie is present', async () => {
    // First create a real user in DB
    const existingUser = await prisma.user.create({
      data: {
        deviceToken: 'known-valid-token',
        displayName: 'Existing Racer',
      }
    })

    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    // @ts-ignore
    cookieStore.get.mockReturnValue({ value: 'known-valid-token' })

    const res = await POST()
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.isNew).toBe(false)
    expect(data.id).toBe(existingUser.id)
    expect(data.deviceToken).toBe('known-valid-token')
  })

  it('creates new user if cookie is present but token is unknown', async () => {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    // @ts-ignore
    cookieStore.get.mockReturnValue({ value: 'unknown-token-123' })

    const res = await POST()
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.isNew).toBe(true)
    expect(data.deviceToken).toBeDefined()
    expect(data.deviceToken).not.toBe('unknown-token-123')
  })
})
