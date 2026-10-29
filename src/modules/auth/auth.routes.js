import { Router } from 'express';

import { authenticate } from '../../shared/middlewares/authenticate.js';
import { authorize } from '../../shared/middlewares/authorize.js';
import { validateRequest } from '../../shared/middlewares/validate-request.js';
import { authController } from './auth.controller.js';
import {
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
  sessionIdSchema,
} from './auth.schemas.js';

// creamos el router para las rutas de autenticación
export const authRouter = Router();

// ruta para registrar un nuevo usuario
authRouter.post('/register', validateRequest(registerSchema), authController.register);

// ruta para iniciar sesión
authRouter.post('/login', validateRequest(loginSchema), authController.login);

// ruta para renovar el access token usando un refresh token
authRouter.post('/refresh', validateRequest(refreshSchema), authController.refresh);

// ruta para cerrar sesión revocando el refresh token
authRouter.post('/logout', validateRequest(logoutSchema), authController.logout);

// ruta para obtener las sesiones activas del usuario autenticado
authRouter.get('/sessions', authenticate, authController.sessions);

// ruta para revocar una sesión específica del usuario autenticado
authRouter.delete(
  '/sessions/:id',
  authenticate,
  validateRequest(sessionIdSchema),
  authController.revokeSession,
);

// ruta para cerrar todas las sesiones activas del usuario autenticado
authRouter.post('/logout-all', authenticate, authController.logoutAll);

// ruta para eliminar los refresh tokens expirados
authRouter.post(
  '/cleanup-expired',
  authenticate,
  authorize('admin'),
  authController.cleanupExpired,
);