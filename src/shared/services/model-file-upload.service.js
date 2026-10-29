import { env } from '../../config/env.js';
import { AppError } from '../errors/app-error.js';
import { cloudinaryService } from './cloudinary.service.js';

// obtenemos un archivo obligatorio del formulario multipart
function getRequiredFile(files, fieldName) {
  const file = files?.[fieldName]?.[0];

  // verificamos que el archivo exista
  if (!file) {
    throw new AppError(`${fieldName} file is required`, 400);
  }

  return file;
}

// servicio para subir paquetes de modelo a cloudinary
export const modelFileUploadService = {
  // subimos model.json, weights.bin y labels.json en una misma carpeta
  async uploadModelBundle(files, folderName) {
    // obtenemos los archivos requeridos
    const model = getRequiredFile(files, 'model');
    const weights = getRequiredFile(files, 'weights');
    const labels = getRequiredFile(files, 'labels');

    // construimos la ruta donde quedara la version del modelo
    const folder = `${env.cloudinary.modelsFolder}/${folderName}`;

    // subimos los tres archivos en paralelo
    const [modelResult, weightsResult, labelsResult] = await Promise.all([
      cloudinaryService.uploadRaw(model, { folder }),
      cloudinaryService.uploadRaw(weights, { folder }),
      cloudinaryService.uploadRaw(labels, { folder }),
    ]);

    // regresamos las urls que se guardaran en postgres
    return {
      modelUrl: modelResult.secure_url,
      weightsUrl: weightsResult.secure_url,
      labelsUrl: labelsResult.secure_url,
    };
  },
};
