import { asyncHandler } from '../../shared/middlewares/async-handler.js';
import { kitchenPreferenceService } from './kitchen-preference.service.js';

// controlador para manejar las preferencias de cocina
export const kitchenPreferenceController = {
  // llamamos al servicio para obtener las preferencias de una cocina
  list: asyncHandler(async (req, res) => {
    const preferences = await kitchenPreferenceService.listPreferences(
      req.user,
      req.query.kitchenId,
    );
    res.json({ data: preferences });
  }),

  // llamamos al servicio para crear una preferencia de cocina
  create: asyncHandler(async (req, res) => {
    const preference = await kitchenPreferenceService.createPreference(
      req.user,
      req.validated.body,
    );
    res.status(201).json({ data: preference });
  }),

  // llamamos al servicio para eliminar una preferencia de cocina
  delete: asyncHandler(async (req, res) => {
    await kitchenPreferenceService.deletePreference(req.validated.params.id);
    res.status(204).send();
  }),
};