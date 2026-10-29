import { asyncHandler } from '../../shared/middlewares/async-handler.js';
import { kitchenService } from './kitchen.service.js';

// controlador para manejar las cocinas
export const kitchenController = {
  // llamamos al servicio para obtener las cocinas del usuario
  list: asyncHandler(async (req, res) => {
    const kitchens = await kitchenService.listKitchens(req.user);
    res.json({ data: kitchens });
  }),

  // llamamos al servicio para crear una cocina
  create: asyncHandler(async (req, res) => {
    const kitchen = await kitchenService.createKitchen(req.user, req.validated.body);
    res.status(201).json({ data: kitchen });
  }),

  // llamamos al servicio para obtener una cocina por su id
  getById: asyncHandler(async (req, res) => {
    const kitchen = await kitchenService.getKitchen(req.user, req.validated.params.id);
    res.json({ data: kitchen });
  }),

  // llamamos al servicio para actualizar una cocina
  update: asyncHandler(async (req, res) => {
    const kitchen = await kitchenService.updateKitchen(
      req.user,
      req.validated.params.id,
      req.validated.body,
    );
    res.json({ data: kitchen });
  }),

  // llamamos al servicio para eliminar una cocina
  delete: asyncHandler(async (req, res) => {
    await kitchenService.deleteKitchen(req.user, req.validated.params.id);
    res.status(204).send();
  }),
};