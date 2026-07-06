import { query } from '../../config/database.js';

// función para convertir el resultado de la base de datos en un objeto modelo de cocina
function mapModel(row) {
  return {
    id: row.id,
    kitchenId: row.kitchen_id,
    baseModelId: row.base_model_id,
    version: row.version,
    modelUrl: row.model_url,
    weightsUrl: row.weights_url,
    labelsUrl: row.labels_url,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

// repositorio para manejar los modelos de cocina
export const kitchenModelRepository = {
  // llamamos a la función para obtener los modelos de una cocina
  async findByKitchen(kitchenId) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT * FROM fn_get_kitchen_models($1)', [kitchenId]);

    // convertimos los registros en objetos de modelo
    return result.rows.map(mapModel);
  },

  // llamamos a la función para obtener el modelo activo de una cocina
  async findActiveByKitchen(kitchenId) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT * FROM fn_get_active_kitchen_model($1)', [kitchenId]);

    // regresamos el modelo si existe o null si no fue encontrado
    return result.rows[0] ? mapModel(result.rows[0]) : null;
  },

  // llamamos a la función para crear un modelo de cocina
  async create(data) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT fn_create_kitchen_model($1, $2, $3, $4, $5, $6, $7) AS id', [
      data.kitchenId,
      data.baseModelId ?? null,
      data.version,
      data.modelUrl,
      data.weightsUrl,
      data.labelsUrl,
      data.isActive ?? true,
    ]);

    // regresamos el id generado junto con los datos almacenados
    return { id: result.rows[0].id, ...data };
  },
};