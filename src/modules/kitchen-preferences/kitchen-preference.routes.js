import { Router } from 'express';

import { validateRequest } from '../../shared/middlewares/validate-request.js';
import { kitchenPreferenceController } from './kitchen-preference.controller.js';
import {
  createKitchenPreferenceSchema,
  preferenceIdSchema,
} from './kitchen-preference.schemas.js';

// creamos el router para las rutas de preferencias de cocina
export const kitchenPreferenceRouter = Router();

// ruta para obtener las preferencias de una cocina
kitchenPreferenceRouter.get('/', kitchenPreferenceController.list);

// ruta para crear una preferencia de cocina
kitchenPreferenceRouter.post(
  '/',
  validateRequest(createKitchenPreferenceSchema),
  kitchenPreferenceController.create,
);

// ruta para eliminar una preferencia de cocina
kitchenPreferenceRouter.delete(
  '/:id',
  validateRequest(preferenceIdSchema),
  kitchenPreferenceController.delete,
);