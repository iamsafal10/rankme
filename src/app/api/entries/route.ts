import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categorySlug = searchParams.get('category')

    if (!categorySlug) {
      return NextResponse.json({ error: 'Category parameter is required' }, { status: 400 })
    }

    const category = await prisma.category.findUnique({
      where: { slug: categorySlug }
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const entries = await prisma.entry.findMany({
      where: { categoryId: category.id },
      orderBy: { points: 'desc' },
      select: {
        id: true,
        name: true,
        college: true,
        gradYear: true,
        points: true,
        avatarUrl: true,
      }
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching entries:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { getDeviceToken } from '@/lib/identity'

export async function POST(request: Request) {
  try {
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

    const body = await request.json()
    const { name, resumeUrl, college, gradYear } = body

    if (!name || !resumeUrl || !college || !gradYear) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const category = await prisma.category.findUnique({
      where: { slug: 'sde-resume-race' }
    })

    if (!category) {
      return NextResponse.json({ error: 'Target category not found' }, { status: 404 })
    }

    // Optional: check if user already has an entry for this category
    const existingEntry = await prisma.entry.findFirst({
      where: { userId: user.id, categoryId: category.id }
    })

    if (existingEntry) {
      return NextResponse.json({ error: 'You have already submitted an entry for this category' }, { status: 400 })
    }

    const entry = await prisma.entry.create({
      data: {
        name,
        resumeUrl,
        college,
        gradYear: Number(gradYear),
        points: 0,
        userId: user.id,
        categoryId: category.id,
      }
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Error creating entry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
