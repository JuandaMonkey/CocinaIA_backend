import { AppError } from '../errors/app-error.js';

// middleware para manejar errores de la aplicacion
export function errorHandler(error, _req, res, _next) {
  // controlamos errores por registros duplicados en postgres
  if (error.code === '23505') {
    return res.status(409).json({
      message: 'Resource already exists',
    });
  }

  // controlamos errores por relaciones o llaves foraneas
  if (error.code === '23503') {
    return res.status(400).json({
      message: 'Related resource constraint failed',
    });
  }

  // respondemos errores conocidos definidos por la aplicacion
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      details: error.details,
    });
  }

  // registramos errores inesperados para depuracion
  console.error(error);

  // ocultamos detalles internos al cliente
  return res.status(500).json({
    message: 'Internal server error',
  });
}
