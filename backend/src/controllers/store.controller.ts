import { Request, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getStores = async (req: AuthRequest, res: Response) => {
  try {
    const { search, sortBy, sortOrder } = req.query;
    const userId = req.user?.userId;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { address: { contains: String(search) } },
      ];
    }

    const orderBy: any = {};
    if (sortBy && typeof sortBy === 'string') {
      orderBy[sortBy] = sortOrder === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.name = 'asc';
    }

    const stores = await prisma.store.findMany({
      where,
      orderBy,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        averageRating: true,
        totalRatings: true,
        ...(userId ? {
          ratings: {
            where: { userId },
            select: { rating: true }
          }
        } : {})
      }
    });

    const formattedStores = stores.map((store: any) => {
      const userRating = store.ratings?.[0]?.rating || null;
      const { ratings, ...rest } = store;
      return { ...rest, userRating };
    });

    return res.status(200).json(formattedStores);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch stores', error: {} });
  }
};

export const getStoreDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const store = await prisma.store.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        address: true,
        averageRating: true,
        totalRatings: true,
      }
    });

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found', error: {} });
    }

    // If user is logged in, find if they submitted a rating
    let userRating = null;
    if (userId) {
      const existingRating = await prisma.rating.findUnique({
        where: {
          userId_storeId: { userId, storeId: id }
        }
      });
      if (existingRating) {
        userRating = existingRating.rating;
      }
    }

    return res.status(200).json({ ...store, userRating });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch store details', error: {} });
  }
};
