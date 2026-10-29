import multer from 'multer';

// middleware para cargar los archivos de un modelo
export const uploadModelFiles = multer({
  // almacenamos los archivos temporalmente en memoria
  storage: multer.memoryStorage(),

  // limitamos el tamaño y la cantidad de archivos permitidos
  limits: {
    fileSize: 25 * 1024 * 1024,
    files: 3,
  },
});