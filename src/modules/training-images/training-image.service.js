import { AppError } from '../../shared/errors/app-error.js';
import { cloudinaryService } from '../../shared/services/cloudinary.service.js';
import { ingredientRepository } from '../ingredients/ingredient.repository.js';
import { trainingImageRepository } from './training-image.repository.js';

// servicio para manejar las imágenes de entrenamiento
export const trainingImageService = {
  // llamamos al repositorio para obtener las imágenes de entrenamiento
  async listTrainingImages({ ingredientId, page = 1, pageSize = 10 }) {
    return trainingImageRepository.findPaginated({
      ingredientId,
      page: Math.max(1, Number(page)),
      pageSize: Math.min(48, Math.max(1, Number(pageSize))),
    });
  },

  // llamamos al servicio para subir una imagen de entrenamiento
  async uploadTrainingImage(data, file) {
    // verificamos que se haya enviado una imagen
    if (!file) {
      throw new AppError('Image file is required', 400);
    }

    // buscamos si existe un ingrediente con la misma etiqueta
    const ingredient = await ingredientRepository.findByName(data.label);

    // subimos la imagen a cloudinary
    const uploadResult = await cloudinaryService.uploadImage(file);

    // guardamos el registro de la imagen
    return trainingImageRepository.create({
      ingredientId: ingredient?.id ?? null,
      label: data.label,
      imageUrl: uploadResult.secure_url,
    });
  },

  // llamamos al repositorio para obtener una imagen de entrenamiento por su id
  async getTrainingImage(id) {
    const trainingImage = await trainingImageRepository.findById(id);

    if (!trainingImage) {
      // si la imagen no existe, lanzamos un error
      throw new AppError('Training image not found', 404);
    }

    return trainingImage;
  },

  // llamamos al repositorio para obtener el dataset de entrenamiento
  async getDataset() {
    return trainingImageRepository.getDataset();
  },

  // llamamos al repositorio para eliminar una imagen de entrenamiento
  async deleteTrainingImage(id) {
    const deleted = await trainingImageRepository.delete(id);

    if (!deleted) {
      // si la imagen no existe, lanzamos un error
      throw new AppError('Training image not found', 404);
    }
  },

  // llamamos al repositorio para actualizar una imagen de entrenamiento
  async updateTrainingImage(id, data) {
    // buscamos si existe un ingrediente con la misma etiqueta
    const ingredient = await ingredientRepository.findByName(data.label);

    const trainingImage = await trainingImageRepository.update(id, {
      label: data.label,
      ingredientId: ingredient?.id ?? null,
    });

    if (!trainingImage) {
      // si la imagen no existe, lanzamos un error
      throw new AppError('Training image not found', 404);
    }

    return trainingImage;
  },
};