import { AppError } from '../../shared/errors/app-error.js';
import { ingredientRepository } from './ingredient.repository.js';

// servicio para manejar los ingredientes
export const ingredientService = {
  // llamamos al repositorio para obtener todos los ingredientes
  async listIngredients() {
    return ingredientRepository.findAll();
  },

  // llamamos al repositorio para crear un ingrediente
  async createIngredient(data) {
    // verificamos si ya existe un ingrediente con el mismo nombre
    const existingIngredient = await ingredientRepository.findByName(data.name);

    if (existingIngredient) {
      // si el ingrediente ya existe, lanzamos un error
      throw new AppError('Ingredient already exists', 409);
    }

    return ingredientRepository.create(data);
  },

  // llamamos al repositorio para obtener un ingrediente por su id
  async getIngredient(id) {
    const ingredient = await ingredientRepository.findById(id);

    if (!ingredient) {
      // si el ingrediente no existe, lanzamos un error
      throw new AppError('Ingredient not found', 404);
    }

    return ingredient;
  },

  // llamamos al repositorio para actualizar un ingrediente
  async updateIngredient(id, data) {
    // verificamos si ya existe otro ingrediente con el mismo nombre
    const existingIngredient = await ingredientRepository.findByName(data.name);

    if (existingIngredient && existingIngredient.id !== id) {
      // si el nombre ya está registrado por otro ingrediente, lanzamos un error
      throw new AppError('Ingredient already exists', 409);
    }

    const ingredient = await ingredientRepository.update(id, data);

    if (!ingredient) {
      // si el ingrediente no existe, lanzamos un error
      throw new AppError('Ingredient not found', 404);
    }

    return ingredient;
  },

  // llamamos al repositorio para eliminar un ingrediente
  async deleteIngredient(id) {
    const deleted = await ingredientRepository.delete(id);

    if (!deleted) {
      // si el ingrediente no existe, lanzamos un error
      throw new AppError('Ingredient not found', 404);
    }
  },
};