import { z } from 'zod';

// esquema para validar la creación de una cocina
export const createKitchenSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    name: z.string().trim().min(2).max(80),
  }),
});

// esquema para validar el id de una cocina
export const kitchenIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// esquema para validar la actualización de una cocina
export const updateKitchenSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().trim().min(2).max(80),
  }),
});