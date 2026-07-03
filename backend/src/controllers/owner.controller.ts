import { Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getOwnerDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const ownerId = req.user?.userId;
    const { sortBy, sortOrder } = req.query;
    
    const ratingsOrderBy: any = {};
    if (sortBy === 'rating') {
      ratingsOrderBy.rating = sortOrder === 'asc' ? 'asc' : 'desc';
    } else if (sortBy === 'createdAt') {
      ratingsOrderBy.createdAt = sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      ratingsOrderBy.createdAt = 'desc';
    }
    
    // Find the store belonging to this owner
    const store = await prisma.store.findUnique({
      where: { ownerId },
      include: {
        ratings: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          },
          orderBy: ratingsOrderBy
        }
      }
    });

    if (!store) {
      return res.status(404).json({ success: false, message: 'You do not own any stores yet.', error: {} });
    }

    return res.status(200).json({
      storeName: store.name,
      averageRating: store.averageRating,
      totalRatings: store.totalRatings,
      ratings: store.ratings.map(r => ({
        rating: r.rating,
        userName: r.user.name,
        userEmail: r.user.email,
        date: r.createdAt
      }))
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch owner dashboard', error: {} });
  }
};
