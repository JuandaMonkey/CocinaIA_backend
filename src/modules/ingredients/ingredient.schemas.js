import { z } from 'zod';

// esquema para validar la creación de un ingrediente
export const createIngredientSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    category: z.string().trim().min(2).max(60),
    baseUnit: z.string().trim().min(1).max(20),
  }),
});

// esquema para validar el id de un ingrediente
export const ingredientIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// esquema para validar la actualización de un ingrediente
export const updateIngredientSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().trim().min(2).max(80),
    category: z.string().trim().min(2).max(60),
    baseUnit: z.string().trim().min(1).max(20),
  }),
});