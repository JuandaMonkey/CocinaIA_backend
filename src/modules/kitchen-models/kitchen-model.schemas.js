import { z } from 'zod';

// esquema para validar la creación de un modelo de cocina
export const createKitchenModelSchema = z.object({
  body: z.object({
    kitchenId: z.string().uuid(),
    baseModelId: z.string().uuid().optional().nullable(),
    version: z.string().trim().min(1).max(50),
    modelUrl: z.string().trim().url(),
    weightsUrl: z.string().trim().url(),
    labelsUrl: z.string().trim().url(),
    isActive: z.boolean().optional(),
  }),
});

// esquema para validar la carga de archivos de un modelo de cocina
export const uploadKitchenModelSchema = z.object({
  body: z.object({
    kitchenId: z.string().uuid(),
    baseModelId: z.string().uuid().optional().nullable(),
    version: z.string().trim().min(1).max(50),

    // convertimos el valor recibido a booleano
    isActive: z
      .enum(['true', 'false'])
      .optional()
      .transform((value) => value !== 'false'),
  }),
});