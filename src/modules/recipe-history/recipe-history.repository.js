import { query } from '../../config/database.js';

// funcion para convertir el resultado de la base de datos en un objeto historial
function mapHistory(row) {
  return {
    id: row.id,
    userId: row.user_id,
    kitchenId: row.kitchen_id,
    recipeId: row.recipe_id,
    recipeName: row.recipe_name,
    rating: row.rating,
    cookedAt: row.cooked_at,
    notes: row.notes,
    status: row.status,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    ingredients: row.ingredients ?? [],
    steps: row.steps ?? [],
  };
}

// funcion para convertir el resultado en un modelo de aprendizaje de recetas
function mapRecipeLearningModel(row) {
  return {
    id: row.id,
    scope: row.scope,
    userId: row.user_id,
    kitchenId: row.kitchen_id,
    version: row.version,
    modelData: row.model_data,
    modelUrl: row.model_url,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

// repositorio para manejar el historial de recetas
export const recipeHistoryRepository = {
  // llamamos a la funcion para obtener las recetas del usuario
  async findByUser(userId) {
    // ejecutamos la funcion de la base de datos
    const result = await query('SELECT * FROM fn_get_user_recipe_history_with_ingredients($1)', [
      userId,
    ]);

    // convertimos los registros en objetos de historial
    return result.rows.map(mapHistory);
  },

  // llamamos a la funcion para obtener un registro del historial por su id
  async findById(id) {
    // ejecutamos la funcion con ingredientes y pasos del historial
    const result = await query('SELECT * FROM fn_get_recipe_history_by_id($1)', [id]);

    // regresamos el historial si existe o null si no fue encontrado
    return result.rows[0] ? mapHistory(result.rows[0]) : null;
  },

  // llamamos a la funcion para crear un registro de historial
  async create(data) {
    // ejecutamos la funcion de la base de datos con ingredientes y pasos
    const result = await query(
      'SELECT fn_create_recipe_history_with_ingredients($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb) AS id',
      [
        data.userId,
        data.kitchenId,
        data.recipeId ?? null,
        data.recipeName,
        data.rating ?? null,
        data.notes ?? null,
        JSON.stringify(data.ingredients ?? []),
        JSON.stringify(data.steps ?? []),
      ],
    );

    // regresamos el id generado junto con los datos almacenados
    return { id: result.rows[0].id, ...data };
  },

  // llamamos a la funcion para obtener el id de cocina del historial
  async findKitchenIdById(id) {
    // ejecutamos la funcion en la base de datos
    const result = await query('SELECT fn_get_recipe_history_kitchen_id($1) AS kitchen_id', [id]);

    // regresamos el id de cocina o null si no existe
    return result.rows[0]?.kitchen_id ?? null;
  },

  // llamamos a la funcion para iniciar una receta del historial
  async start(id) {
    // ejecutamos la funcion de la base de datos
    const result = await query('SELECT fn_start_recipe_history($1) AS updated', [id]);

    // regresamos si el historial fue actualizado correctamente
    return result.rows[0].updated;
  },

  // llamamos a la funcion para finalizar una receta del historial
  async finish(id) {
    // ejecutamos la funcion de la base de datos
    const result = await query('SELECT fn_finish_recipe_history($1) AS updated', [id]);

    // regresamos si el historial fue actualizado correctamente
    return result.rows[0].updated;
  },

  // llamamos a la funcion para repetir una receta guardada
  async repeat(id, kitchenId, userId) {
    // ejecutamos la funcion de la base de datos
    const result = await query('SELECT fn_repeat_recipe_history($1, $2, $3) AS id', [
      id,
      kitchenId,
      userId,
    ]);

    // regresamos el id de la receta reabierta
    return result.rows[0].id;
  },

  // llamamos a la funcion para eliminar un registro del historial
  async delete(id) {
    // ejecutamos la funcion de eliminacion en la base de datos
    const result = await query('SELECT fn_delete_recipe_history($1) AS deleted', [id]);

    // regresamos si el registro fue eliminado correctamente
    return result.rows[0].deleted;
  },

  // llamamos a la funcion para obtener estadisticas de la cocina
  async getInsights(kitchenId) {
    // ejecutamos la funcion de la base de datos
    const result = await query('SELECT fn_get_kitchen_insights($1) AS insights', [kitchenId]);

    // regresamos las estadisticas organizadas para la respuesta
    return result.rows[0].insights;
  },

  // llamamos a la funcion para reconstruir los modelos de recetas
  async rebuildRecipeLearningModels(userId, kitchenId) {
    // ejecutamos la funcion de la base de datos
    const result = await query('SELECT * FROM fn_rebuild_recipe_learning_models($1, $2)', [
      userId,
      kitchenId,
    ]);

    // convertimos los modelos en objetos de aplicacion
    return result.rows.map(mapRecipeLearningModel);
  },

  // llamamos a la funcion para guardar la url del modelo de recetas
  async setRecipeLearningModelUrl(modelId, modelUrl) {
    // ejecutamos la funcion de la base de datos
    const result = await query('SELECT fn_set_recipe_learning_model_url($1, $2) AS updated', [
      modelId,
      modelUrl,
    ]);

    // regresamos si la url fue actualizada
    return result.rows[0].updated;
  },
};
