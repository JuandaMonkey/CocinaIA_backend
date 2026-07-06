import { query } from '../../config/database.js';

// funcion para convertir el resultado en un modelo de recetas
function mapRecipeLearningModel(row) {
  return {
    id: row.id,
    scope: row.scope,
    userId: row.user_id,
    kitchenId: row.kitchen_id,
    userName: row.user_name,
    kitchenName: row.kitchen_name,
    version: row.version,
    modelData: row.model_data,
    modelUrl: row.model_url,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

// repositorio para manejar los modelos de recetas
export const recipeLearningModelRepository = {
  // llamamos a la funcion para buscar modelos de recetas registrados
  async findAll({ scope, search }) {
    // ejecutamos la funcion de la base de datos
    const result = await query('SELECT * FROM fn_get_recipe_learning_models($1, $2)', [
      scope ?? null,
      search ?? null,
    ]);

    // convertimos los registros en objetos de aplicacion
    return result.rows.map(mapRecipeLearningModel);
  },
};
