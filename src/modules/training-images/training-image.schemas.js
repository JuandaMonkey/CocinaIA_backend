import { z } from 'zod';

// esquema para validar la carga de una imagen de entrenamiento
export const uploadTrainingImageSchema = z.object({
  body: z.object({
    label: z.string().trim().min(2).max(100),
  }),
});

// esquema para validar el id de una imagen de entrenamiento
export const trainingImageIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// esquema para validar la actualización de una imagen de entrenamiento
export const updateTrainingImageSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    label: z.string().trim().min(2).max(100),
  }),
});

export const cleanupDatasetSchema = z.object({
  body: z.object({
    deleteDuplicateIds: z.array(z.string().uuid()).default([]),
    labelChoices: z
      .array(
        z.object({
          normalizedLabel: z.string().trim().min(1).max(100),
          label: z.string().trim().min(2).max(100),
        }),
      )
      .default([]),
  }),
});
