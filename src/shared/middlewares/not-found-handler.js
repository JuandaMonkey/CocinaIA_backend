// middleware para responder cuando una ruta no existe
export function notFoundHandler(req, res) {
  // regresamos un error indicando que la ruta no fue encontrada
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}
