import { recipeLearningModelRepository } from './recipe-learning-model.repository.js';

// servicio para manejar los modelos de recetas
export const recipeLearningModelService = {
  // llamamos al repositorio para listar modelos de recetas
  async listModels(filters) {
    return recipeLearningModelRepository.findAll(filters);
  },
};
