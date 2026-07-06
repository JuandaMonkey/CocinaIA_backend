import { query } from '../../config/database.js';

// función para convertir el resultado de la base de datos en un objeto preferencia
function mapPreference(row) {
  return {
    id: row.id,
    kitchenId: row.kitchen_id,
    preferenceType: row.preference_type,
    value: row.value,
    createdAt: row.created_at,
  };
}

// repositorio para manejar las preferencias de cocina
export const kitchenPreferenceRepository = {
  // llamamos a la función para obtener las preferencias de una cocina
  async findByKitchen(kitchenId) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT * FROM fn_get_kitchen_preferences($1)', [kitchenId]);

    // convertimos los registros en objetos de preferencia
    return result.rows.map(mapPreference);
  },

  // llamamos a la función para crear una preferencia de cocina
  async create(data) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT fn_create_kitchen_preference($1, $2, $3) AS id', [
      data.kitchenId,
      data.preferenceType,
      data.value,
    ]);

    // regresamos el id generado junto con los datos almacenados
    return { id: result.rows[0].id, ...data };
  },

  // llamamos a la función para eliminar una preferencia de cocina
  async delete(id) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT fn_delete_kitchen_preference($1) AS deleted', [id]);

    // regresamos si la preferencia fue eliminada correctamente
    return result.rows[0].deleted;
  },
};