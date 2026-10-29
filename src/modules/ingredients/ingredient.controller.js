import { asyncHandler } from '../../shared/middlewares/async-handler.js';
import { ingredientService } from './ingredient.service.js';

// controlador para manejar los ingredientes
export const ingredientController = {
  // llamamos al servicio para obtener todos los ingredientes
  list: asyncHandler(async (_req, res) => {
    const ingredients = await ingredientService.listIngredients();
    res.json({ data: ingredients });
  }),

  // llamamos al servicio para crear un ingrediente
  create: asyncHandler(async (req, res) => {
    const ingredient = await ingredientService.createIngredient(req.validated.body);
    res.status(201).json({ data: ingredient });
  }),

  // llamamos al servicio para obtener un ingrediente por su id
  getById: asyncHandler(async (req, res) => {
    const ingredient = await ingredientService.getIngredient(req.validated.params.id);
    res.json({ data: ingredient });
  }),

  // llamamos al servicio para actualizar un ingrediente
  update: asyncHandler(async (req, res) => {
    const ingredient = await ingredientService.updateIngredient(
      req.validated.params.id,
      req.validated.body,
    );
    res.json({ data: ingredient });
  }),

  // llamamos al servicio para eliminar un ingrediente
  delete: asyncHandler(async (req, res) => {
    await ingredientService.deleteIngredient(req.validated.params.id);
    res.status(204).send();
  }),
};