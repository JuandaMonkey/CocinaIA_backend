import { asyncHandler } from '../../shared/middlewares/async-handler.js';
import { trainingImageService } from './training-image.service.js';

// controlador para manejar las imágenes de entrenamiento
export const trainingImageController = {
  // llamamos al servicio para obtener las imágenes de entrenamiento
  list: asyncHandler(async (req, res) => {
    const trainingImages = await trainingImageService.listTrainingImages({
      ingredientId: req.query.ingredientId,
      page: req.query.page,
      pageSize: req.query.pageSize,
    });
    res.json({ data: trainingImages });
  }),

  // llamamos al servicio para subir una imagen de entrenamiento
  upload: asyncHandler(async (req, res) => {
    const trainingImage = await trainingImageService.uploadTrainingImage(
      req.validated.body,
      req.file,
    );
    res.status(201).json({ data: trainingImage });
  }),

  // llamamos al servicio para obtener una imagen de entrenamiento por su id
  getById: asyncHandler(async (req, res) => {
    const trainingImage = await trainingImageService.getTrainingImage(req.validated.params.id);
    res.json({ data: trainingImage });
  }),

  // llamamos al servicio para obtener el dataset de entrenamiento
  dataset: asyncHandler(async (_req, res) => {
    const dataset = await trainingImageService.getDataset();
    res.json({ data: dataset });
  }),

  analyzeDataset: asyncHandler(async (_req, res) => {
    const analysis = await trainingImageService.analyzeDataset();
    res.json({ data: analysis });
  }),

  cleanupDataset: asyncHandler(async (_req, res) => {
    const result = await trainingImageService.cleanupDataset(_req.validated.body);
    res.json({ data: result });
  }),

  // llamamos al servicio para eliminar una imagen de entrenamiento
  delete: asyncHandler(async (req, res) => {
    await trainingImageService.deleteTrainingImage(req.validated.params.id);
    res.status(204).send();
  }),

  // llamamos al servicio para actualizar una imagen de entrenamiento
  update: asyncHandler(async (req, res) => {
    const trainingImage = await trainingImageService.updateTrainingImage(
      req.validated.params.id,
      req.validated.body,
    );
    res.json({ data: trainingImage });
  }),
};
