import { query } from '../../config/database.js';

// función para convertir el resultado de la base de datos en un objeto ingrediente
function mapIngredient(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    baseUnit: row.base_unit,
    createdAt: row.created_at,
  };
}

// repositorio para manejar los ingredientes
export const ingredientRepository = {
  // llamamos a la función para obtener todos los ingredientes
  async findAll() {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT * FROM fn_get_ingredients()');

    // convertimos los registros en objetos de ingrediente
    return result.rows.map(mapIngredient);
  },

  // llamamos a la función para obtener un ingrediente por su id
  async findById(id) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT * FROM fn_get_ingredient_by_id($1)', [id]);

    // regresamos el ingrediente si existe o null si no fue encontrado
    return result.rows[0] ? mapIngredient(result.rows[0]) : null;
  },

  // llamamos a la función para buscar un ingrediente por su nombre
  async findByName(name) {
    // normalizamos el nombre para evitar diferencias entre mayúsculas y minúsculas
    const normalizedName = name.trim().toLowerCase();

    // obtenemos todos los ingredientes
    const ingredients = await this.findAll();

    // regresamos el ingrediente si existe o null si no fue encontrado
    return ingredients.find((ingredient) => ingredient.name.toLowerCase() === normalizedName) ?? null;
  },

  // llamamos a la función para crear un ingrediente
  async create(data) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT fn_create_ingredient($1, $2, $3) AS id', [
      data.name,
      data.category,
      data.baseUnit,
    ]);

    // regresamos el ingrediente creado
    return this.findById(result.rows[0].id);
  },

  // llamamos a la función para actualizar un ingrediente
  async update(id, data) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT fn_update_ingredient($1, $2, $3, $4) AS updated', [
      id,
      data.name,
      data.category,
      data.baseUnit,
    ]);

    // regresamos el ingrediente actualizado o null si no existe
    return result.rows[0].updated ? this.findById(id) : null;
  },

  // llamamos a la función para eliminar un ingrediente
  async delete(id) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT fn_delete_ingredient($1) AS deleted', [id]);

    // regresamos si el ingrediente fue eliminado correctamente
    return result.rows[0].deleted;
  },
};