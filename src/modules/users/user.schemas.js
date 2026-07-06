import { z } from 'zod';

// esquema para validar la creación de un usuario
export const createUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(150),
    password: z.string().min(8).max(100),
    role: z.enum(['admin', 'user']).optional(),
  }),
});

// esquema para validar el id de un usuario
export const userIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// esquema para validar la actualización de un usuario
export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(150),
    role: z.enum(['admin', 'user']).optional(),
    isActive: z.boolean().optional(),
  }),
});