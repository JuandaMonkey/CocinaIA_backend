import { AppError } from '../../shared/errors/app-error.js';
import { kitchenAccessService } from '../../shared/services/kitchen-access.service.js';
import { kitchenPreferenceRepository } from './kitchen-preference.repository.js';

// servicio para manejar las preferencias de cocina
export const kitchenPreferenceService = {
  // llamamos al repositorio para obtener las preferencias de una cocina
  async listPreferences(user, kitchenId) {
    // verificamos que el usuario tenga acceso a la cocina
    await kitchenAccessService.assertCanAccessKitchen(user, kitchenId);

    return kitchenPreferenceRepository.findByKitchen(kitchenId);
  },

  // llamamos al repositorio para crear una preferencia de cocina
  async createPreference(user, data) {
    // verificamos que el usuario tenga acceso a la cocina
    await kitchenAccessService.assertCanAccessKitchen(user, data.kitchenId);

    return kitchenPreferenceRepository.create(data);
  },

  // llamamos al repositorio para eliminar una preferencia de cocina
  async deletePreference(id) {
    const deleted = await kitchenPreferenceRepository.delete(id);

    if (!deleted) {
      // si la preferencia no existe, lanzamos un error
      throw new AppError('Preference not found', 404);
    }
  },
};