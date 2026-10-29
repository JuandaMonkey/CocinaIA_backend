import { z } from 'zod';

// esquema para validar la busqueda de modelos de recetas
export const listRecipeLearningModelsSchema = z.object({
  query: z.object({
    scope: z.enum(['global', 'user', 'kitchen']).optional(),
    search: z.string().trim().max(150).optional(),
  }),
});
