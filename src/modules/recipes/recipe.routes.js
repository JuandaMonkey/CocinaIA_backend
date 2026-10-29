import { Router } from 'express';

import { recipeController } from './recipe.controller.js';

// creamos el router para las rutas de recetas
export const recipeRouter = Router();

// ruta para obtener todas las recetas
recipeRouter.get('/', recipeController.list);