import { Router } from 'express';

import { validateRequest } from '../../shared/middlewares/validate-request.js';
import { kitchenController } from './kitchen.controller.js';
import { createKitchenSchema, kitchenIdSchema, updateKitchenSchema } from './kitchen.schemas.js';

// creamos el router para las rutas de cocinas
export const kitchenRouter = Router();

// ruta para obtener las cocinas del usuario
kitchenRouter.get('/', kitchenController.list);

// ruta para crear una cocina
kitchenRouter.post('/', validateRequest(createKitchenSchema), kitchenController.create);

// ruta para obtener una cocina por su id
kitchenRouter.get('/:id', validateRequest(kitchenIdSchema), kitchenController.getById);

// ruta para actualizar una cocina
kitchenRouter.put('/:id', validateRequest(updateKitchenSchema), kitchenController.update);

// ruta para eliminar una cocina
kitchenRouter.delete('/:id', validateRequest(kitchenIdSchema), kitchenController.delete);