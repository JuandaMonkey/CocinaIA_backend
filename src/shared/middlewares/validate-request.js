import { AppError } from '../errors/app-error.js';

// middleware para validar body, params y query con zod
export function validateRequest(schema) {
  // regresamos el middleware de validacion
  return (req, _res, next) => {
    // validamos los datos de entrada con el esquema recibido
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      // si la validacion falla, enviamos detalles al cliente
      throw new AppError('Validation error', 400, result.error.flatten());
    }

    // guardamos los datos validados para controladores y servicios
    req.validated = result.data;

    // continuamos con la siguiente funcion
    next();
  };
}
