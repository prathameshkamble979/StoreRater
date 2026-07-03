import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../index';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ]);

    return res.status(200).json({ totalUsers, totalStores, totalRatings });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats', error: {} });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, address, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already exists', error: {} });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, passwordHash, address, role },
      select: { id: true, name: true, email: true, role: true, address: true, createdAt: true }
    });

    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create user', error: {} });
  }
};

export const createStore = async (req: Request, res: Response) => {
  try {
    const { name, email, address, ownerId } = req.body;

    // Ensure owner exists and is a STORE_OWNER
    const owner = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner) {
      return res.status(404).json({ success: false, message: 'Owner not found', error: {} });
    }
    if (owner.role !== 'STORE_OWNER') {
      return res.status(400).json({ success: false, message: 'User is not a STORE_OWNER', error: {} });
    }

    // Check if owner already has a store
    const existingStoreForOwner = await prisma.store.findUnique({ where: { ownerId } });
    if (existingStoreForOwner) {
      return res.status(409).json({ success: false, message: 'This owner already has a store', error: {} });
    }

    // Check if store email exists
    const existingStoreEmail = await prisma.store.findUnique({ where: { email } });
    if (existingStoreEmail) {
      return res.status(409).json({ success: false, message: 'Store email already exists', error: {} });
    }

    const store = await prisma.store.create({
      data: { name, email, address, ownerId }
    });

    return res.status(201).json(store);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create store', error: {} });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { search, role, sortBy, sortOrder } = req.query;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { email: { contains: String(search) } },
        { address: { contains: String(search) } },
      ];
    }
    
    if (role) {
      where.role = String(role);
    }

    const orderBy: any = {};
    if (sortBy && typeof sortBy === 'string') {
      orderBy[sortBy] = sortOrder === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const users = await prisma.user.findMany({
      where,
      orderBy,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
      }
    });

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch users', error: {} });
  }
};

export const getUserDetails = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            averageRating: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', error: {} });
    }

    // Remove password hash from response
    const { passwordHash, ...safeUser } = user;
    return res.status(200).json(safeUser);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch user details', error: {} });
  }
};

export const getRatings = async (req: Request, res: Response) => {
  try {
    const { sortBy, sortOrder } = req.query;

    const orderBy: any = {};
    if (sortBy === 'rating') {
      orderBy.rating = sortOrder === 'asc' ? 'asc' : 'desc';
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const ratings = await prisma.rating.findMany({
      include: {
        user: { select: { name: true, email: true } },
        store: { select: { name: true } }
      },
      orderBy,
      take: 50 // Limit to 50 for performance
    });
    return res.status(200).json(ratings);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch ratings', error: {} });
  }
};
