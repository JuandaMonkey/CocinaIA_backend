import { z } from 'zod';

// esquema para validar la creación de una preferencia de cocina
export const createKitchenPreferenceSchema = z.object({
  body: z.object({
    kitchenId: z.string().uuid(),
    preferenceType: z.string().trim().min(2).max(80),
    value: z.string().trim().min(1).max(150),
  }),
});

// esquema para validar el id de una preferencia
export const preferenceIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});