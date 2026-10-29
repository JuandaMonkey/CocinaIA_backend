import { asyncHandler } from '../../shared/middlewares/async-handler.js';
import { pantryService } from './pantry.service.js';

// controlador para manejar los elementos de la despensa
export const pantryController = {
  // llamamos al servicio para obtener los elementos de la despensa
  list: asyncHandler(async (req, res) => {
    const pantryItems = await pantryService.listPantryItems(req.user, req.query.kitchenId);
    res.json({ data: pantryItems });
  }),

  // llamamos al servicio para agregar un elemento a la despensa
  create: asyncHandler(async (req, res) => {
    const pantryItem = await pantryService.addPantryItem(req.user, req.validated.body);
    res.status(201).json({ data: pantryItem });
  }),

  // llamamos al servicio para obtener un elemento de la despensa por su id
  getById: asyncHandler(async (req, res) => {
    const pantryItem = await pantryService.getPantryItem(req.user, req.validated.params.id);
    res.json({ data: pantryItem });
  }),

  // llamamos al servicio para actualizar un elemento de la despensa
  update: asyncHandler(async (req, res) => {
    const pantryItem = await pantryService.updatePantryItem(
      req.user,
      req.validated.params.id,
      req.validated.body,
    );
    res.json({ data: pantryItem });
  }),

  // llamamos al servicio para eliminar un elemento de la despensa
  delete: asyncHandler(async (req, res) => {
    await pantryService.deletePantryItem(req.user, req.validated.params.id);
    res.status(204).send();
  }),
};