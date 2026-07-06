import { asyncHandler } from '../../shared/middlewares/async-handler.js';
import { userService } from './user.service.js';

// controlador para manejar los usuarios
export const userController = {
  // llamamos al servicio para obtener todos los usuarios
  list: asyncHandler(async (_req, res) => {
    const users = await userService.listUsers();
    res.json({ data: users });
  }),

  // llamamos al servicio para crear un usuario
  create: asyncHandler(async (req, res) => {
    const user = await userService.createUser(req.validated.body);
    res.status(201).json({ data: user });
  }),

  // llamamos al servicio para obtener un usuario por su id
  getById: asyncHandler(async (req, res) => {
    const user = await userService.getUser(req.validated.params.id);
    res.json({ data: user });
  }),

  // llamamos al servicio para actualizar un usuario
  update: asyncHandler(async (req, res) => {
    const user = await userService.updateUser(req.validated.params.id, req.validated.body);
    res.json({ data: user });
  }),

  // llamamos al servicio para eliminar un usuario
  delete: asyncHandler(async (req, res) => {
    await userService.deleteUser(req.validated.params.id);
    res.status(204).send();
  }),
};