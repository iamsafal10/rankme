import { prisma } from './prisma'

export async function awardPoints(
  entryId: string,
  userId: string,
  amount: number,
  type: string
) {
  if (amount <= 0) {
    throw new Error('Amount must be greater than zero')
  }

  // Use an interactive transaction to ensure both records are written atomically.
  // We use increment to safely add points without race conditions.
  return await prisma.$transaction(async (tx) => {
    // 1. Create the transaction log record
    const transaction = await tx.pointTransaction.create({
      data: {
        amount,
        type,
        userId,
        entryId,
      }
    })

    // 2. Increment the entry's points
    const updatedEntry = await tx.entry.update({
      where: { id: entryId },
      data: {
        points: { increment: amount }
      }
    })

    return { transaction, updatedEntry }
  })
}
