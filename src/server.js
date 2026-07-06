import { createApp } from './app.js';
import { env } from './config/env.js';

// creamos la aplicacion express configurada
const app = createApp();

// iniciamos el servidor http
app.listen(env.port, () => {
  // mostramos en consola donde queda disponible la api
  console.info(`API running on http://localhost:${env.port}${env.apiPrefix}`);
});
