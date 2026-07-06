import { recipeRepository } from './recipe.repository.js';

// servicio para manejar las recetas
export const recipeService = {
  // llamamos al repositorio para obtener todas las recetas
  async listRecipes() {
    return recipeRepository.findAll();
  },
};