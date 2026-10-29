import { Router } from 'express';

import { uploadModelFiles } from '../../shared/middlewares/upload-model-files.js';
import { validateRequest } from '../../shared/middlewares/validate-request.js';
import { kitchenModelController } from './kitchen-model.controller.js';
import { createKitchenModelSchema, uploadKitchenModelSchema } from './kitchen-model.schemas.js';

// creamos el router para las rutas de modelos de cocina
export const kitchenModelRouter = Router();

// ruta para obtener los modelos de una cocina
kitchenModelRouter.get('/', kitchenModelController.list);

// ruta para obtener el modelo activo de una cocina
kitchenModelRouter.get('/active', kitchenModelController.active);

// ruta para registrar un modelo de cocina
kitchenModelRouter.post('/', validateRequest(createKitchenModelSchema), kitchenModelController.create);

// ruta para subir archivos del modelo de cocina y registrar sus urls
kitchenModelRouter.post(
  '/upload',
  uploadModelFiles.fields([
    { name: 'model', maxCount: 1 },
    { name: 'weights', maxCount: 1 },
    { name: 'labels', maxCount: 1 },
  ]),
  validateRequest(uploadKitchenModelSchema),
  kitchenModelController.upload,
);