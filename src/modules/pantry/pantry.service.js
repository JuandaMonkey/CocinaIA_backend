import { AppError } from '../../shared/errors/app-error.js';
import { kitchenAccessService } from '../../shared/services/kitchen-access.service.js';
import { ingredientRepository } from '../ingredients/ingredient.repository.js';
import { pantryRepository } from './pantry.repository.js';

// servicio para manejar los elementos de la despensa
export const pantryService = {
  // llamamos al repositorio para obtener los elementos de una cocina
  async listPantryItems(user, kitchenId) {
    // verificamos que se haya enviado el id de la cocina
    if (!kitchenId) {
      throw new AppError('kitchenId query param is required', 400);
    }

    // verificamos que el usuario tenga acceso a la cocina
    await kitchenAccessService.assertCanAccessKitchen(user, kitchenId);

    return pantryRepository.findByKitchenId(kitchenId);
  },

  // llamamos al repositorio para agregar un elemento a la despensa
  async addPantryItem(user, data) {
    // verificamos que el usuario tenga acceso a la cocina
    await kitchenAccessService.assertCanAccessKitchen(user, data.kitchenId);

    // verificamos que el ingrediente exista
    const ingredient = await ingredientRepository.findById(data.ingredientId);

    if (!ingredient) {
      // si el ingrediente no existe, lanzamos un error
      throw new AppError('Ingredient not found', 404);
    }

    return pantryRepository.create(data);
  },

  // llamamos al repositorio para obtener un elemento de la despensa por su id
  async getPantryItem(user, id) {
    const pantryItem = await pantryRepository.findById(id);

    if (!pantryItem) {
      // si el elemento no existe, lanzamos un error
      throw new AppError('Pantry item not found', 404);
    }

    // verificamos que el usuario tenga acceso a la cocina
    await kitchenAccessService.assertCanAccessKitchen(user, pantryItem.kitchenId);

    return pantryItem;
  },

  // llamamos al repositorio para actualizar un elemento de la despensa
  async updatePantryItem(user, id, data) {
    // verificamos que el usuario tenga acceso al elemento
    await this.getPantryItem(user, id);

    const pantryItem = await pantryRepository.update(id, data);

    if (!pantryItem) {
      // si el elemento no existe, lanzamos un error
      throw new AppError('Pantry item not found', 404);
    }

    return pantryItem;
  },

  // llamamos al repositorio para eliminar un elemento de la despensa
  async deletePantryItem(user, id) {
    // verificamos que el usuario tenga acceso al elemento
    await this.getPantryItem(user, id);

    const deleted = await pantryRepository.delete(id);

    if (!deleted) {
      // si el elemento no existe, lanzamos un error
      throw new AppError('Pantry item not found', 404);
    }
  },
};