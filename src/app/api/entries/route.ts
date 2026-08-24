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
