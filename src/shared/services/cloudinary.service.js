import { cloudinary } from '../../config/cloudinary.js';
import { env } from '../../config/env.js';
import { AppError } from '../errors/app-error.js';

// servicio para subir imagenes y modelos a cloudinary
export const cloudinaryService = {
  // subimos una imagen y regresamos su url publica
  uploadImage(file, options = {}) {
    // verificamos que las credenciales esten configuradas
    if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
      throw new AppError('Cloudinary credentials are not configured', 500);
    }

    return new Promise((resolve, reject) => {
      // usamos stream para no escribir archivos temporales en disco
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder ?? env.cloudinary.trainingFolder,
          resource_type: 'image',
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) {
            // rechazamos la promesa si cloudinary falla
            reject(error);
            return;
          }

          // regresamos la informacion de la imagen cargada
          resolve(result);
        },
      );

      // enviamos el buffer recibido por multer
      uploadStream.end(file.buffer);
    });
  },

  // subimos archivos raw como model.json, weights.bin o labels.json
  uploadRaw(file, options = {}) {
    // verificamos que las credenciales esten configuradas
    if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
      throw new AppError('Cloudinary credentials are not configured', 500);
    }

    return new Promise((resolve, reject) => {
      // cargamos el archivo como raw para conservar su formato
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder ?? env.cloudinary.modelsFolder,
          resource_type: 'raw',
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) {
            // rechazamos la promesa si cloudinary falla
            reject(error);
            return;
          }

          // regresamos la informacion del archivo cargado
          resolve(result);
        },
      );

      // enviamos el buffer recibido o generado
      uploadStream.end(file.buffer);
    });
  },

  // subimos snapshots json generados por el backend
  uploadJson(name, data, options = {}) {
    const file = {
      originalname: `${name}.json`,
      buffer: Buffer.from(JSON.stringify(data, null, 2)),
    };

    return this.uploadRaw(file, options);
  },
};
