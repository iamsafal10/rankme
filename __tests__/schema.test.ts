import 'dotenv/config';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

afterAll(async () => {
  await prisma.$disconnect();
  await pool.end();
});

describe('Prisma Schema Constraints', () => {
  it('should fail to create a Category without required fields', async () => {
    await expect(
      // @ts-expect-error Testing invalid input
      prisma.category.create({
        data: {
          description: 'Invalid category',
        },
      })
    ).rejects.toThrow();
  });

  it('should successfully create an isolated test Category', async () => {
    const category = await prisma.category.create({
      data: {
        slug: 'test-category-' + Date.now(),
        name: 'Test Category',
      },
    });
    expect(category.id).toBeDefined();
    expect(category.isActive).toBe(true); // Default value check
  });

  it('should fail to create an Entry without a valid userId and categoryId', async () => {
    await expect(
      prisma.entry.create({
        data: {
          userId: 'non-existent-user',
          categoryId: 'non-existent-category',
          name: 'Test Entry',
          college: 'Test College',
          gradYear: 2024,
          resumeUrl: 'https://example.com/test',
        },
      })
    ).rejects.toThrow();
  });
});

describe('Seed Script Behavior', () => {
  it('should have created the SDE Resume Race category', async () => {
    const category = await prisma.category.findUnique({
      where: { slug: 'sde-resume-race' },
    });
    expect(category).not.toBeNull();
    expect(category?.name).toBe('SDE Resume Race');
  });

  it('should have seeded users correctly', async () => {
    const users = await prisma.user.findMany({
      where: {
        deviceToken: { in: ['demo-token-1', 'demo-token-2', 'demo-token-3'] },
      },
    });
    expect(users.length).toBe(3);
  });

  it('should have seeded entries with correct initial points via transactions', async () => {
    const category = await prisma.category.findUnique({
      where: { slug: 'sde-resume-race' },
    });
    
    const entries = await prisma.entry.findMany({
      where: { categoryId: category!.id },
      include: { transactions: true },
      orderBy: { points: 'desc' },
    });

    expect(entries.length).toBe(3);
    expect(entries[0].points).toBe(150);
    expect(entries[0].transactions.length).toBeGreaterThanOrEqual(1);
    expect(entries[0].transactions[0].amount).toBe(150);
  });
});
