import { Router } from 'express';

import { authorize } from '../../shared/middlewares/authorize.js';
import { validateRequest } from '../../shared/middlewares/validate-request.js';
import { uploadImage } from '../../shared/middlewares/upload-image.js';
import {
  cleanupDatasetSchema,
  trainingImageIdSchema,
  updateTrainingImageSchema,
  uploadTrainingImageSchema,
} from './training-image.schemas.js';
import { trainingImageController } from './training-image.controller.js';

// creamos el router para las rutas de imágenes de entrenamiento
export const trainingImageRouter = Router();

// ruta para obtener las imágenes de entrenamiento
trainingImageRouter.get('/', trainingImageController.list);

// ruta para obtener el dataset de entrenamiento
trainingImageRouter.get('/dataset', trainingImageController.dataset);

trainingImageRouter.get('/quality', authorize('admin'), trainingImageController.analyzeDataset);
trainingImageRouter.post(
  '/quality/cleanup',
  authorize('admin'),
  validateRequest(cleanupDatasetSchema),
  trainingImageController.cleanupDataset,
);

// ruta para subir una imagen de entrenamiento
trainingImageRouter.post(
  '/upload',
  uploadImage.single('image'),
  validateRequest(uploadTrainingImageSchema),
  trainingImageController.upload,
);

// ruta para obtener una imagen de entrenamiento por su id
trainingImageRouter.get(
  '/:id',
  validateRequest(trainingImageIdSchema),
  trainingImageController.getById,
);

// ruta para actualizar una imagen de entrenamiento
trainingImageRouter.put(
  '/:id',
  validateRequest(updateTrainingImageSchema),
  trainingImageController.update,
);

// ruta para eliminar una imagen de entrenamiento
trainingImageRouter.delete(
  '/:id',
  validateRequest(trainingImageIdSchema),
  trainingImageController.delete,
);
