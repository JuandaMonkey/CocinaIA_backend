import { v2 as cloudinary } from 'cloudinary';

import { env } from './env.js';

// configuramos la conexion con la api de cloudinary
cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
  secure: true,
});

// exportamos la instancia configurada para servicios de archivos
export { cloudinary };
