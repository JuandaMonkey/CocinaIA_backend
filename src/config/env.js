import 'dotenv/config';

// centralizamos variables de entorno para no leer process.env en toda la app
export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  apiPrefix: process.env.API_PREFIX ?? '/api/v1',
  jwtSecret: process.env.JWT_SECRET ?? 'development_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  refreshTokenExpiresDays: Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS ?? 30),
  databaseUrl: process.env.DATABASE_URL,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    trainingFolder: process.env.CLOUDINARY_TRAINING_FOLDER ?? 'cocina-inteligente/training-images',
    modelsFolder: process.env.CLOUDINARY_MODELS_FOLDER ?? 'cocina-inteligente/models',
  },
};
