import { AppError } from '../errors/app-error.js';
import { kitchenRepository } from '../../modules/kitchens/kitchen.repository.js';

// servicio para validar acceso a cocinas
export const kitchenAccessService = {
  // verificamos que el usuario pueda consultar o modificar una cocina
  async assertCanAccessKitchen(user, kitchenId) {
    // buscamos la cocina por su id
    const kitchen = await kitchenRepository.findById(kitchenId);

    if (!kitchen) {
      // si la cocina no existe, detenemos el flujo
      throw new AppError('Kitchen not found', 404);
    }

    // permitimos acceso si es administrador o dueño de la cocina
    if (user.role === 'admin' || kitchen.userId === user.sub) {
      return kitchen;
    }

    // rechazamos acceso cruzado entre usuarios
    throw new AppError('You do not have access to this kitchen', 403);
  },
};
