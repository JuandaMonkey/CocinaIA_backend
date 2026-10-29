import { Router } from 'express';

import { validateRequest } from '../../shared/middlewares/validate-request.js';
import { recipeHistoryController } from './recipe-history.controller.js';
import {
  createRecipeHistorySchema,
  recipeHistoryIdSchema,
  recipeHistoryInsightsSchema,
  repeatRecipeHistorySchema,
} from './recipe-history.schemas.js';

// creamos el router para las rutas del historial de recetas
export const recipeHistoryRouter = Router();

// ruta para obtener estadísticas del historial de recetas
recipeHistoryRouter.get(
  '/insights',
  validateRequest(recipeHistoryInsightsSchema),
  recipeHistoryController.insights,
);

// ruta para iniciar una receta del historial
recipeHistoryRouter.patch(
  '/:id/start',
  validateRequest(recipeHistoryIdSchema),
  recipeHistoryController.start,
);

// ruta para finalizar una receta del historial
recipeHistoryRouter.patch(
  '/:id/finish',
  validateRequest(recipeHistoryIdSchema),
  recipeHistoryController.finish,
);

// ruta para repetir una receta guardada sin descontar ingredientes todavia
recipeHistoryRouter.post(
  '/:id/repeat',
  validateRequest(repeatRecipeHistorySchema),
  recipeHistoryController.repeat,
);

// ruta para obtener un registro del historial por su id
recipeHistoryRouter.get(
  '/:id',
  validateRequest(recipeHistoryIdSchema),
  recipeHistoryController.getById,
);

// ruta para eliminar un registro del historial
recipeHistoryRouter.delete(
  '/:id',
  validateRequest(recipeHistoryIdSchema),
  recipeHistoryController.delete,
);

// ruta para obtener el historial de recetas
recipeHistoryRouter.get('/', recipeHistoryController.list);

// ruta para crear un registro en el historial
recipeHistoryRouter.post(
  '/',
  validateRequest(createRecipeHistorySchema),
  recipeHistoryController.create,
);
