// función para manejar errores en funciones asíncronas
export function asyncHandler(handler) {
  // envolvemos la función para capturar errores automáticamente
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}