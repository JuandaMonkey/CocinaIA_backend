// clase para manejar errores personalizados de la aplicación
export class AppError extends Error {
  // inicializamos el error con mensaje, código y detalles opcionales
  constructor(message, statusCode = 500, details = undefined) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}