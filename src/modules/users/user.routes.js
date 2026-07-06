import { Router } from 'express';

import { validateRequest } from '../../shared/middlewares/validate-request.js';
import { authenticate } from '../../shared/middlewares/authenticate.js';
import { authorize } from '../../shared/middlewares/authorize.js';
import { userController } from './user.controller.js';
import { createUserSchema, updateUserSchema, userIdSchema } from './user.schemas.js';

// creamos el router para las rutas de usuarios
export const userRouter = Router();

// protegemos todas las rutas para que solo el administrador pueda usarlas
userRouter.use(authenticate, authorize('admin'));

// ruta para obtener todos los usuarios
userRouter.get('/', userController.list);

// ruta para crear un usuario
userRouter.post('/', validateRequest(createUserSchema), userController.create);

// ruta para obtener un usuario por su id
userRouter.get('/:id', validateRequest(userIdSchema), userController.getById);

// ruta para actualizar un usuario
userRouter.put('/:id', validateRequest(updateUserSchema), userController.update);

// ruta para eliminar un usuario
userRouter.delete('/:id', validateRequest(userIdSchema), userController.delete);