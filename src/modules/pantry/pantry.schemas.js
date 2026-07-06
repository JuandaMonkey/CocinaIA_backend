import { z } from 'zod';

// esquema para validar la creación de un elemento de la despensa
export const addPantryItemSchema = z.object({
  body: z.object({
    kitchenId: z.string().uuid(),
    ingredientId: z.string().uuid(),
    quantity: z.number().positive(),
    unit: z.string().trim().min(1).max(20),
    expirationDate: z.string().date().optional(),
  }),
});

// esquema para validar el id de un elemento de la despensa
export const pantryItemIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// esquema para validar la actualización de un elemento de la despensa
export const updatePantryItemSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    quantity: z.number().positive(),
    unit: z.string().trim().min(1).max(20),
    expirationDate: z.string().date().optional().nullable(),
  }),
});