import { asyncHandler } from '../../shared/middlewares/async-handler.js';
import { kitchenModelService } from './kitchen-model.service.js';

// controlador para manejar los modelos de cocina
export const kitchenModelController = {
  // llamamos al servicio para obtener los modelos de una cocina
  list: asyncHandler(async (req, res) => {
    const models = await kitchenModelService.listKitchenModels(req.user, req.query.kitchenId);
    res.json({ data: models });
  }),

  // llamamos al servicio para obtener el modelo activo de una cocina
  active: asyncHandler(async (req, res) => {
    const model = await kitchenModelService.getActiveKitchenModel(req.user, req.query.kitchenId);
    res.json({ data: model });
  }),

  // llamamos al servicio para crear un modelo de cocina
  create: asyncHandler(async (req, res) => {
    const model = await kitchenModelService.createKitchenModel(req.user, req.validated.body);
    res.status(201).json({ data: model });
  }),

  // llamamos al servicio para subir un modelo de cocina con sus archivos
  upload: asyncHandler(async (req, res) => {
    const model = await kitchenModelService.uploadKitchenModel(
      req.user,
      req.validated.body,
      req.files,
    );
    res.status(201).json({ data: model });
  }),
};