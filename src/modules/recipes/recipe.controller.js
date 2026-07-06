import { asyncHandler } from '../../shared/middlewares/async-handler.js';
import { recipeService } from './recipe.service.js';

// controlador para manejar las recetas
export const recipeController = {
  // llamamos al servicio para obtener todas las recetas
  list: asyncHandler(async (_req, res) => {
    const recipes = await recipeService.listRecipes();
    res.json({ data: recipes });
  }),
};