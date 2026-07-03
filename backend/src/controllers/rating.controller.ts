import { Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middlewares/auth.middleware';

export const submitRating = async (req: AuthRequest, res: Response) => {
  try {
    const { storeId } = req.params;
    const { rating } = req.body; // expected 1-5
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized', error: {} });

    // Validate rating
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5', error: {} });
    }

    // Validate Store exists and prevent self-rating
    const targetStore = await prisma.store.findUnique({ where: { id: storeId } });
    if (!targetStore) {
      return res.status(404).json({ success: false, message: 'Store not found', error: {} });
    }
    if (targetStore.ownerId === userId) {
      return res.status(403).json({ success: false, message: 'Store owners cannot rate their own store', error: {} });
    }

    // Business Rule: Normal users only
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.role === 'ADMIN' || user?.role === 'STORE_OWNER') {
      return res.status(403).json({ success: false, message: 'Only normal users can submit ratings', error: {} });
    }

    // Optimize for high-latency connections (Railway DB) using a single raw SQL transaction block
    // This reduces multiple WAN round-trips to just 1.
    await prisma.$executeRaw`
      INSERT INTO Rating (id, rating, userId, storeId, updatedAt)
      VALUES (UUID(), ${rating}, ${userId}, ${storeId}, NOW(3))
      ON DUPLICATE KEY UPDATE rating = ${rating}, updatedAt = NOW(3);
    `;

    await prisma.$executeRaw`
      UPDATE Store s
      SET 
        s.totalRatings = (SELECT COUNT(*) FROM Rating r WHERE r.storeId = s.id),
        s.averageRating = COALESCE((SELECT AVG(rating) FROM Rating r WHERE r.storeId = s.id), 0)
      WHERE s.id = ${storeId};
    `;

    return res.status(200).json({ message: 'Rating submitted successfully' });
  } catch (error) {
    console.error('Rating error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit rating', error: {} });
  }
};
