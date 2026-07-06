import { kitchenAccessService } from '../../shared/services/kitchen-access.service.js';
import { modelFileUploadService } from '../../shared/services/model-file-upload.service.js';
import { kitchenModelRepository } from './kitchen-model.repository.js';

// servicio para manejar los modelos de cocina
export const kitchenModelService = {
  // llamamos al servicio para obtener los modelos de una cocina
  async listKitchenModels(user, kitchenId) {
    // verificamos que el usuario tenga acceso a la cocina
    await kitchenAccessService.assertCanAccessKitchen(user, kitchenId);

    return kitchenModelRepository.findByKitchen(kitchenId);
  },

  // llamamos al servicio para obtener el modelo activo de una cocina
  async getActiveKitchenModel(user, kitchenId) {
    // verificamos que el usuario tenga acceso a la cocina
    await kitchenAccessService.assertCanAccessKitchen(user, kitchenId);

    return kitchenModelRepository.findActiveByKitchen(kitchenId);
  },

  // llamamos al servicio para crear un modelo de cocina
  async createKitchenModel(user, data) {
    // verificamos que el usuario tenga acceso a la cocina
    await kitchenAccessService.assertCanAccessKitchen(user, data.kitchenId);

    return kitchenModelRepository.create(data);
  },

  // llamamos al servicio para subir los archivos de un modelo de cocina
  async uploadKitchenModel(user, data, files) {
    // verificamos que el usuario tenga acceso a la cocina
    await kitchenAccessService.assertCanAccessKitchen(user, data.kitchenId);

    // subimos los archivos y obtenemos sus urls
    const urls = await modelFileUploadService.uploadModelBundle(
      files,
      `kitchens/${data.kitchenId}/${data.version}`,
    );

    // guardamos el modelo junto con las urls generadas
    return kitchenModelRepository.create({
      ...data,
      ...urls,
    });
  },
};