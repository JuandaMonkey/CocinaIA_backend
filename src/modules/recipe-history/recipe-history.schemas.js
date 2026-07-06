import { z } from 'zod';

// esquema para validar la creación de un registro en el historial de recetas
export const createRecipeHistorySchema = z.object({
  body: z.object({
    kitchenId: z.string().uuid(),
    recipeId: z.string().uuid().optional().nullable(),
    recipeName: z.string().trim().min(2).max(150),
    rating: z.number().int().min(1).max(5).optional().nullable(),
    notes: z.string().trim().max(1000).optional().nullable(),

    // validamos la lista de ingredientes utilizados
    ingredients: z
      .array(
        z.object({
          ingredientId: z.string().uuid(),
          quantity: z.number().positive(),
          unit: z.string().trim().min(1).max(30),
        }),
      )
      .optional()
      .default([]),

    // validamos la lista de pasos de la receta
    steps: z
      .array(
        z.object({
          stepNumber: z.number().int().positive(),
          instruction: z.string().trim().min(1).max(1000),
        }),
      )
      .optional()
      .default([]),
  }),
});

// esquema para validar la consulta de estadísticas del historial
export const recipeHistoryInsightsSchema = z.object({
  query: z.object({
    kitchenId: z.string().uuid(),
  }),
});

// esquema para validar el id de un registro del historial
export const recipeHistoryIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// esquema para validar la repeticion de una receta guardada
export const repeatRecipeHistorySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    kitchenId: z.string().uuid(),
  }),
});
