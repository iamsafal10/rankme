import { cookies } from 'next/headers'

export const DEVICE_TOKEN_COOKIE = 'rankme_device_token'

export async function getDeviceToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(DEVICE_TOKEN_COOKIE)?.value
}

export async function setDeviceToken(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(DEVICE_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  })
}
