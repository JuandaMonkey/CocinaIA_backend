import { z } from 'zod';

// esquema para validar la creación de un modelo global
export const createGlobalModelSchema = z.object({
  body: z.object({
    version: z.string().trim().min(1).max(50),
    modelUrl: z.string().trim().url(),
    weightsUrl: z.string().trim().url(),
    labelsUrl: z.string().trim().url(),
    isActive: z.boolean().optional(),
  }),
});

// esquema para validar la carga de archivos de un modelo global
export const uploadGlobalModelSchema = z.object({
  body: z.object({
    version: z.string().trim().min(1).max(50),

    // convertimos el valor recibido a booleano
    isActive: z
      .enum(['true', 'false'])
      .optional()
      .transform((value) => value === 'true'),
  }),
});