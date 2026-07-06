import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env.js';
import { query } from './config/database.js';
import { swaggerSpec } from './config/swagger.js';
import { apiRouter } from './routes.js';
import { errorHandler } from './shared/middlewares/error-handler.js';
import { notFoundHandler } from './shared/middlewares/not-found-handler.js';

// funcion para crear y configurar la aplicacion
export function createApp() {
  const app = express();

  // agregamos encabezados de seguridad
  app.use(
    helmet({
      contentSecurityPolicy: env.nodeEnv === 'production' ? undefined : false,
    }),
  );

  // habilitamos cors
  app.use(cors());

  // limitamos la cantidad de peticiones por cliente
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // habilitamos el procesamiento de json
  app.use(express.json({ limit: '2mb' }));

  // registramos las peticiones realizadas al servidor
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

  // ruta para verificar el estado de la aplicacion y la base de datos
  app.get('/health', async (_req, res, next) => {
    try {
      // comprobamos la conexion con la base de datos
      await query('SELECT 1');

      res.status(200).json({
        status: 'ok',
        service: 'ci-backend',
        environment: env.nodeEnv,
        database: 'connected',
      });
    } catch (error) {
      // enviamos el error al middleware correspondiente
      next(error);
    }
  });

  // ruta para verificar unicamente el estado de la aplicacion
  app.get('/health/app', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'ci-backend',
      environment: env.nodeEnv,
    });
  });

  // publicamos la documentacion de swagger
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // regresamos la especificacion de swagger en formato json
  app.get('/api-docs.json', (_req, res) => {
    res.json(swaggerSpec);
  });

  // registramos las rutas principales de la api
  app.use(env.apiPrefix, apiRouter);

  // manejamos las rutas que no existen
  app.use(notFoundHandler);

  // manejamos los errores de la aplicacion
  app.use(errorHandler);

  return app;
}
