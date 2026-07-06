import { query } from '../../config/database.js';

// función para convertir el resultado de la base de datos en un objeto cocina
function mapKitchen(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    ownerName: row.owner_name,
    createdAt: row.created_at,
  };
}

// repositorio para manejar las cocinas
export const kitchenRepository = {
  // llamamos a la función para obtener todas las cocinas
  async findAll() {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT * FROM fn_get_kitchens()');

    // convertimos los registros en objetos de cocina
    return result.rows.map(mapKitchen);
  },

  // llamamos a la función para obtener una cocina por su id
  async findById(id) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT * FROM fn_get_kitchen_by_id($1)', [id]);

    // regresamos la cocina si existe o null si no fue encontrada
    return result.rows[0] ? mapKitchen(result.rows[0]) : null;
  },

  // llamamos a la función para crear una cocina
  async create(data) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT fn_create_kitchen($1, $2) AS id', [data.userId, data.name]);

    // regresamos la cocina creada
    return this.findById(result.rows[0].id);
  },

  // llamamos a la función para obtener las cocinas de un usuario
  async findByUserId(userId) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT * FROM fn_get_kitchens_by_user($1)', [userId]);

    // convertimos los registros en objetos de cocina
    return result.rows.map(mapKitchen);
  },

  // llamamos a la función para actualizar una cocina
  async update(id, data) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT fn_update_kitchen($1, $2) AS updated', [id, data.name]);

    // regresamos la cocina actualizada o null si no existe
    return result.rows[0].updated ? this.findById(id) : null;
  },

  // llamamos a la función para eliminar una cocina
  async delete(id) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT fn_delete_kitchen($1) AS deleted', [id]);

    // regresamos si la cocina fue eliminada correctamente
    return result.rows[0].deleted;
  },
};