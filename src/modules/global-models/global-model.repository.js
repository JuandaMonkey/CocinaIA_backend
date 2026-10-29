import { query } from '../../config/database.js';

// función para convertir el resultado de la base de datos en un objeto modelo global
function mapModel(row) {
  return {
    id: row.id,
    version: row.version,
    modelUrl: row.model_url,
    weightsUrl: row.weights_url,
    labelsUrl: row.labels_url,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

// repositorio para manejar los modelos globales
export const globalModelRepository = {
  // llamamos a la función para obtener todos los modelos globales
  async findAll() {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT * FROM fn_get_global_models()');

    // convertimos los registros en objetos de modelo
    return result.rows.map(mapModel);
  },

  // llamamos a la función para obtener el modelo global activo
  async findActive() {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT * FROM fn_get_active_global_model()');

    // regresamos el modelo si existe o null si no fue encontrado
    return result.rows[0] ? mapModel(result.rows[0]) : null;
  },

  // llamamos a la función para crear un nuevo modelo global
  async create(data) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT fn_create_global_model($1, $2, $3, $4, $5) AS id', [
      data.version,
      data.modelUrl,
      data.weightsUrl,
      data.labelsUrl,
      data.isActive ?? false,
    ]);

    // regresamos el id generado junto con los datos almacenados
    return { id: result.rows[0].id, ...data };
  },

  // llamamos a la función para activar un modelo global
  async activate(id) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT * FROM fn_activate_global_model($1)', [id]);

    // regresamos el modelo activado o null si no existe
    return result.rows[0] ? mapModel(result.rows[0]) : null;
  },
};