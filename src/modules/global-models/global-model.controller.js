import { asyncHandler } from '../../shared/middlewares/async-handler.js';
import { globalModelService } from './global-model.service.js';

// controlador para manejar los modelos globales
export const globalModelController = {
  // llamamos al servicio para obtener todos los modelos globales
  list: asyncHandler(async (_req, res) => {
    const models = await globalModelService.listGlobalModels();
    res.json({ data: models });
  }),

  // llamamos al servicio para obtener el modelo global activo
  active: asyncHandler(async (_req, res) => {
    const model = await globalModelService.getActiveGlobalModel();
    res.json({ data: model });
  }),

  // llamamos al servicio para crear un nuevo modelo global
  create: asyncHandler(async (req, res) => {
    const model = await globalModelService.createGlobalModel(req.validated.body);
    res.status(201).json({ data: model });
  }),

  // llamamos al servicio para subir un modelo global con sus archivos
  upload: asyncHandler(async (req, res) => {
    const model = await globalModelService.uploadGlobalModel(req.validated.body, req.files);
    res.status(201).json({ data: model });
  }),

  // llamamos al servicio para activar un modelo global
  activate: asyncHandler(async (req, res) => {
    const model = await globalModelService.activateGlobalModel(req.params.id);
    res.json({ data: model });
  }),
};