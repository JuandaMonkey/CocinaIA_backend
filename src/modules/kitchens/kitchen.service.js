import { AppError } from '../../shared/errors/app-error.js';
import { kitchenAccessService } from '../../shared/services/kitchen-access.service.js';
import { kitchenRepository } from './kitchen.repository.js';

// servicio para manejar las cocinas
export const kitchenService = {
  // llamamos al repositorio para obtener las cocinas
  async listKitchens(user) {
    // si el usuario no es administrador, solo obtiene sus propias cocinas
    if (user.role !== 'admin') {
      return kitchenRepository.findByUserId(user.sub);
    }

    // si es administrador, obtiene todas las cocinas
    return kitchenRepository.findAll();
  },

  // llamamos al repositorio para crear una cocina
  async createKitchen(user, data) {
    // verificamos que el usuario solo pueda crear cocinas para sí mismo
    if (user.role !== 'admin' && data.userId !== user.sub) {
      throw new AppError('You can only create kitchens for your own user', 403);
    }

    return kitchenRepository.create(data);
  },

  // llamamos al servicio para obtener una cocina por su id
  async getKitchen(user, id) {
    return kitchenAccessService.assertCanAccessKitchen(user, id);
  },

  // llamamos al repositorio para actualizar una cocina
  async updateKitchen(user, id, data) {
    // verificamos que el usuario tenga acceso a la cocina
    await kitchenAccessService.assertCanAccessKitchen(user, id);

    const kitchen = await kitchenRepository.update(id, data);

    if (!kitchen) {
      // si la cocina no existe, lanzamos un error
      throw new AppError('Kitchen not found', 404);
    }

    return kitchen;
  },

  // llamamos al repositorio para eliminar una cocina
  async deleteKitchen(user, id) {
    // verificamos que el usuario tenga acceso a la cocina
    await kitchenAccessService.assertCanAccessKitchen(user, id);

    const deleted = await kitchenRepository.delete(id);

    if (!deleted) {
      // si la cocina no existe, lanzamos un error
      throw new AppError('Kitchen not found', 404);
    }
  },
};