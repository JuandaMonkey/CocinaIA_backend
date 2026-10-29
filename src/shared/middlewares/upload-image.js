import multer from 'multer';

import { AppError } from '../errors/app-error.js';

// tipos de imágenes permitidos para la carga de archivos
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

// middleware para cargar imágenes
export const uploadImage = multer({
  // almacenamos la imagen temporalmente en memoria
  storage: multer.memoryStorage(),

  // limitamos el tamaño máximo del archivo
  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  // validamos el tipo de archivo recibido
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      // si el tipo de archivo no es válido, lanzamos un error
      return callback(new AppError('Only JPG, PNG and WEBP images are allowed', 400));
    }

    // permitimos continuar con la carga del archivo
    return callback(null, true);
  },
});