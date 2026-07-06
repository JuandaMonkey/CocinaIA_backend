import { asyncHandler } from '../../shared/middlewares/async-handler.js';
import { recipeLearningModelService } from './recipe-learning-model.service.js';

// controlador para manejar los modelos de recetas
export const recipeLearningModelController = {
  // llamamos al servicio para listar modelos de recetas
  list: asyncHandler(async (req, res) => {
    const models = await recipeLearningModelService.listModels(req.query);
    res.json({ data: models });
  }),
};
