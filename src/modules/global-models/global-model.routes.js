import { Router } from 'express';

import { authenticate } from '../../shared/middlewares/authenticate.js';
import { authorize } from '../../shared/middlewares/authorize.js';
import { uploadModelFiles } from '../../shared/middlewares/upload-model-files.js';
import { validateRequest } from '../../shared/middlewares/validate-request.js';
import { globalModelController } from './global-model.controller.js';
import { createGlobalModelSchema, uploadGlobalModelSchema } from './global-model.schemas.js';

// creamos el router para las rutas de modelos globales
export const globalModelRouter = Router();

// ruta para listar todos los modelos globales
globalModelRouter.get('/', globalModelController.list);

// ruta para obtener el modelo global activo
globalModelRouter.get('/active', globalModelController.active);

// ruta para registrar un modelo global manualmente
globalModelRouter.post(
  '/',
  authenticate,
  authorize('admin'),
  validateRequest(createGlobalModelSchema),
  globalModelController.create,
);

// ruta para subir archivos del modelo global y registrar sus urls
globalModelRouter.post(
  '/upload',
  authenticate,
  authorize('admin'),
  uploadModelFiles.fields([
    { name: 'model', maxCount: 1 },
    { name: 'weights', maxCount: 1 },
    { name: 'labels', maxCount: 1 },
  ]),
  validateRequest(uploadGlobalModelSchema),
  globalModelController.upload,
);

// ruta para marcar un modelo global como activo
globalModelRouter.patch(
  '/:id/activate',
  authenticate,
  authorize('admin'),
  globalModelController.activate,
);