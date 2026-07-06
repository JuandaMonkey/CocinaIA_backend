import { query } from '../../config/database.js';

// función para convertir el resultado de la base de datos en un objeto de despensa
function mapPantryItem(row) {
  return {
    id: row.pantry_item_id ?? row.id,
    kitchenId: row.kitchen_id,
    ingredientId: row.ingredient_id,
    ingredientName: row.ingredient_name,
    category: row.category,
    quantity: row.quantity === null ? null : Number(row.quantity),
    unit: row.unit,
    expirationDate: row.expiration_date,
    createdAt: row.created_at,
  };
}

// repositorio para manejar los elementos de la despensa
export const pantryRepository = {
  // llamamos a la función para obtener todos los elementos de la despensa
  async findAll() {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT * FROM fn_get_pantry_items()');

    // convertimos los registros en objetos de despensa
    return result.rows.map(mapPantryItem);
  },

  // llamamos a la función para obtener los elementos de una cocina
  async findByKitchenId(kitchenId) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT * FROM fn_get_kitchen_pantry($1)', [kitchenId]);

    // convertimos los registros en objetos de despensa
    return result.rows.map(mapPantryItem);
  },

  // llamamos a la función para obtener un elemento de la despensa por su id
  async findById(id) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT * FROM fn_get_pantry_item_by_id($1)', [id]);

    // regresamos el elemento si existe o null si no fue encontrado
    return result.rows[0] ? mapPantryItem(result.rows[0]) : null;
  },

  // llamamos a la función para agregar un elemento a la despensa
  async create(data) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT fn_add_pantry_item($1, $2, $3, $4, $5) AS id', [
      data.kitchenId,
      data.ingredientId,
      data.quantity,
      data.unit,
      data.expirationDate ?? null,
    ]);

    // regresamos el id generado junto con los datos almacenados
    return {
      id: result.rows[0].id,
      ...data,
    };
  },

  // llamamos a la función para actualizar un elemento de la despensa
  async update(id, data) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT fn_update_pantry_item($1, $2, $3, $4) AS updated', [
      id,
      data.quantity,
      data.unit,
      data.expirationDate ?? null,
    ]);

    // regresamos el elemento actualizado o null si no existe
    return result.rows[0].updated ? this.findById(id) : null;
  },

  // llamamos a la función para eliminar un elemento de la despensa
  async delete(id) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT fn_delete_pantry_item($1) AS deleted', [id]);

    // regresamos si el elemento fue eliminado correctamente
    return result.rows[0].deleted;
  },
};