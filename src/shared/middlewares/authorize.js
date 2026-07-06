import { AppError } from '../errors/app-error.js';

// middleware para autorizar acceso segun el rol del usuario
export function authorize(...allowedRoles) {
  // regresamos el middleware con los roles permitidos
  return (req, _res, next) => {
    // verificamos que exista un usuario autenticado
    if (!req.user) {
      throw new AppError('Authenticated user is required', 401);
    }

    // verificamos que el rol tenga permisos para esta ruta
    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError('Insufficient permissions', 403);
    }

    // continuamos con la siguiente funcion
    next();
  };
}
