import { z } from 'zod';

// Name: Min 20, Max 60
// Address: Max 400
// Password: 8-16, 1 uppercase, 1 special
// Email: Standard email

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(20, 'Name must be at least 20 characters').max(60, 'Name cannot exceed 60 characters'),
    email: z.string().email('Invalid email address format'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(16, 'Password cannot exceed 16 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
    address: z.string().max(400, 'Address cannot exceed 400 characters').optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const updatePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(16, 'Password cannot exceed 16 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  }),
});
