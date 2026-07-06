import { modelFileUploadService } from '../../shared/services/model-file-upload.service.js';
import { globalModelRepository } from './global-model.repository.js';

// servicio para manejar los modelos globales
export const globalModelService = {
  // llamamos al repositorio para obtener todos los modelos globales
  listGlobalModels() {
    return globalModelRepository.findAll();
  },

  // llamamos al repositorio para obtener el modelo global activo
  getActiveGlobalModel() {
    return globalModelRepository.findActive();
  },

  // llamamos al repositorio para crear un modelo global
  createGlobalModel(data) {
    return globalModelRepository.create(data);
  },

  // llamamos al servicio para subir los archivos del modelo y registrarlo
  async uploadGlobalModel(data, files) {
    // subimos los archivos y obtenemos sus urls
    const urls = await modelFileUploadService.uploadModelBundle(files, `global/${data.version}`);

    // guardamos el modelo junto con las urls generadas
    return globalModelRepository.create({
      ...data,
      ...urls,
    });
  },

  // llamamos al repositorio para activar un modelo global
  activateGlobalModel(id) {
    return globalModelRepository.activate(id);
  },
};