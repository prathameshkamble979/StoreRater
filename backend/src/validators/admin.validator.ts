import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(20).max(60),
    email: z.string().email(),
    password: z.string().min(8).max(16).regex(/[A-Z]/).regex(/[!@#$%^&*(),.?":{}|<>]/),
    address: z.string().max(400).optional(),
    role: z.enum(['ADMIN', 'NORMAL', 'STORE_OWNER']),
  }),
});

export const createStoreSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(255),
    email: z.string().email(),
    address: z.string().min(1, "Address is required").max(400),
    ownerId: z.string().uuid("Invalid owner ID format"),
  }),
});
