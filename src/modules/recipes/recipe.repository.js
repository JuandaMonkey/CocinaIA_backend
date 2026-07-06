import { query } from '../../config/database.js';

// función para convertir el resultado de la base de datos en un objeto receta
function mapRecipe(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    instructions: row.instructions,
    prepTimeMinutes: row.prep_time_minutes,
    difficulty: row.difficulty,
  };
}

// repositorio para manejar las recetas
export const recipeRepository = {
  // llamamos a la función para obtener todas las recetas
  async findAll() {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT * FROM fn_get_recipes()');

    // convertimos los registros en objetos de receta
    return result.rows.map(mapRecipe);
  },
};