import { asyncHandler } from '../../shared/middlewares/async-handler.js';
import { recipeHistoryService } from './recipe-history.service.js';

// controlador para manejar el historial de recetas
export const recipeHistoryController = {
  // llamamos al servicio para obtener el historial de recetas
  list: asyncHandler(async (req, res) => {
    const history = await recipeHistoryService.listHistory(req.user, req.query.kitchenId);
    res.json({ data: history });
  }),

  // llamamos al servicio para crear un registro en el historial
  create: asyncHandler(async (req, res) => {
    const history = await recipeHistoryService.createHistory(req.user, req.validated.body);
    res.status(201).json({ data: history });
  }),

  // llamamos al servicio para obtener un registro del historial por su id
  getById: asyncHandler(async (req, res) => {
    const history = await recipeHistoryService.getHistory(req.user, req.validated.params.id);
    res.json({ data: history });
  }),

  // llamamos al servicio para obtener estadísticas del historial
  insights: asyncHandler(async (req, res) => {
    const insights = await recipeHistoryService.getInsights(req.user, req.query.kitchenId);
    res.json({ data: insights });
  }),

  // llamamos al servicio para iniciar un registro del historial
  start: asyncHandler(async (req, res) => {
    const history = await recipeHistoryService.startHistory(req.user, req.validated.params.id);
    res.json({ data: history });
  }),

  // llamamos al servicio para finalizar un registro del historial
  finish: asyncHandler(async (req, res) => {
    const history = await recipeHistoryService.finishHistory(req.user, req.validated.params.id);
    res.json({ data: history });
  }),

  // llamamos al servicio para repetir una receta guardada
  repeat: asyncHandler(async (req, res) => {
    const history = await recipeHistoryService.repeatHistory(
      req.user,
      req.validated.params.id,
      req.validated.body.kitchenId,
    );
    res.status(201).json({ data: history });
  }),

  // llamamos al servicio para eliminar un registro del historial
  delete: asyncHandler(async (req, res) => {
    await recipeHistoryService.deleteHistory(req.user, req.validated.params.id);
    res.status(204).send();
  }),
};
