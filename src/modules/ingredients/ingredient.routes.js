import { Router } from 'express';

import { validateRequest } from '../../shared/middlewares/validate-request.js';
import { authenticate } from '../../shared/middlewares/authenticate.js';
import { authorize } from '../../shared/middlewares/authorize.js';
import { ingredientController } from './ingredient.controller.js';
import {
  createIngredientSchema,
  ingredientIdSchema,
  updateIngredientSchema,
} from './ingredient.schemas.js';

// creamos el router para las rutas de ingredientes
export const ingredientRouter = Router();

// ruta para obtener todos los ingredientes
ingredientRouter.get('/', ingredientController.list);

// ruta para crear un ingrediente
ingredientRouter.post(
  '/',
  validateRequest(createIngredientSchema),
  ingredientController.create,
);

// ruta para obtener un ingrediente por su id
ingredientRouter.get('/:id', validateRequest(ingredientIdSchema), ingredientController.getById);

// ruta para actualizar un ingrediente
ingredientRouter.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validateRequest(updateIngredientSchema),
  ingredientController.update,
);

// ruta para eliminar un ingrediente
ingredientRouter.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validateRequest(ingredientIdSchema),
  ingredientController.delete,
);