import { Router } from 'express';

import { authorize } from '../../shared/middlewares/authorize.js';
import { validateRequest } from '../../shared/middlewares/validate-request.js';
import { recipeLearningModelController } from './recipe-learning-model.controller.js';
import { listRecipeLearningModelsSchema } from './recipe-learning-model.schemas.js';

// creamos el router para las rutas de modelos de recetas
export const recipeLearningModelRouter = Router();

// protegemos los modelos de recetas para uso administrativo
recipeLearningModelRouter.use(authorize('admin'));

// ruta para listar modelos de recetas registrados
recipeLearningModelRouter.get(
  '/',
  validateRequest(listRecipeLearningModelsSchema),
  recipeLearningModelController.list,
);
