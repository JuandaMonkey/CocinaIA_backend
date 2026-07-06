import { Router } from 'express';

import { validateRequest } from '../../shared/middlewares/validate-request.js';
import { pantryController } from './pantry.controller.js';
import {
  addPantryItemSchema,
  pantryItemIdSchema,
  updatePantryItemSchema,
} from './pantry.schemas.js';

// creamos el router para las rutas de despensa
export const pantryRouter = Router();

// ruta para obtener los elementos de la despensa
pantryRouter.get('/', pantryController.list);

// ruta para agregar un ingrediente a la despensa
pantryRouter.post('/', validateRequest(addPantryItemSchema), pantryController.create);

// ruta para obtener un elemento de la despensa por su id
pantryRouter.get('/:id', validateRequest(pantryItemIdSchema), pantryController.getById);

// ruta para actualizar un elemento de la despensa
pantryRouter.put('/:id', validateRequest(updatePantryItemSchema), pantryController.update);

// ruta para eliminar un elemento de la despensa
pantryRouter.delete('/:id', validateRequest(pantryItemIdSchema), pantryController.delete);