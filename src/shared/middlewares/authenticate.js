import { AppError } from '../errors/app-error.js';
import { tokenService } from '../services/token.service.js';

// middleware para autenticar al usuario mediante un jwt
export function authenticate(req, _res, next) {
  const authorization = req.headers.authorization;

  // verificamos que el encabezado de autorizacion exista y tenga formato bearer
  if (!authorization?.startsWith('Bearer ')) {
    throw new AppError('Authorization token is required', 401);
  }

  // obtenemos el token del encabezado
  const token = authorization.replace('Bearer ', '').trim();

  try {
    // verificamos el token y guardamos el usuario en la peticion
    req.user = tokenService.verify(token);
    next();
  } catch {
    // si el token es invalido o expiro, rechazamos la peticion
    throw new AppError('Invalid or expired token', 401);
  }
}
