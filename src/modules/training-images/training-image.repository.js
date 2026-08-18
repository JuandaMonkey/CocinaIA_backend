import { pool, query } from '../../config/database.js';

// función para convertir el resultado de la base de datos en un objeto imagen de entrenamiento
function mapTrainingImage(row) {
  return {
    id: row.id,
    ingredientId: row.ingredient_id,
    ingredientName: row.ingredient_name,
    label: row.label,
    imageUrl: row.image_url,
    createdAt: row.created_at,
  };
}

// repositorio para manejar las imágenes de entrenamiento
export const trainingImageRepository = {
  // llamamos a la función para obtener imágenes de entrenamiento paginadas
  async findPaginated({ page, pageSize, ingredientId }) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT * FROM fn_get_training_images_paginated($1, $2, $3)', [
      page,
      pageSize,
      ingredientId ?? null,
    ]);

    // obtenemos el total de registros encontrados
    const total = Number(result.rows[0]?.total_count ?? 0);

    // regresamos los registros junto con la paginación
    return {
      items: result.rows.map(mapTrainingImage),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  },

  // llamamos a la función para obtener todas las imágenes de entrenamiento
  async findAll() {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT * FROM fn_get_training_images()');

    // convertimos los registros en objetos de imagen de entrenamiento
    return result.rows.map(mapTrainingImage);
  },

  // llamamos a la función para obtener imágenes por ingrediente
  async findByIngredientId(ingredientId) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT * FROM fn_get_training_images_by_ingredient($1)', [
      ingredientId,
    ]);

    // convertimos los registros en objetos de imagen de entrenamiento
    return result.rows.map(mapTrainingImage);
  },

  // llamamos a la función para obtener una imagen de entrenamiento por su id
  async findById(id) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT * FROM fn_get_training_image_by_id($1)', [id]);

    // regresamos la imagen si existe o null si no fue encontrada
    return result.rows[0] ? mapTrainingImage(result.rows[0]) : null;
  },

  // llamamos a la función para obtener el dataset de entrenamiento
  async getDataset() {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT * FROM fn_get_training_dataset()');

    // organizamos las imágenes por etiqueta
    return result.rows.map((row) => ({
      label: row.label,
      ingredientId: row.ingredient_id,
      images: row.images,
      count: Number(row.image_count),
    }));
  },

  // llamamos a la función para crear una imagen de entrenamiento
  async create(data) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT fn_create_training_image($1, $2, $3) AS id', [
      data.ingredientId ?? null,
      data.label,
      data.imageUrl,
    ]);

    // regresamos el id generado junto con los datos almacenados
    return {
      id: result.rows[0].id,
      ...data,
    };
  },

  // llamamos a la función para eliminar una imagen de entrenamiento
  async delete(id) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT fn_delete_training_image($1) AS deleted', [id]);

    // regresamos si la imagen fue eliminada correctamente
    return result.rows[0].deleted;
  },

  // llamamos a la función para actualizar una imagen de entrenamiento
  async update(id, data) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT fn_update_training_image($1, $2, $3) AS updated', [
      id,
      data.ingredientId ?? null,
      data.label,
    ]);

    // regresamos la imagen actualizada o null si no existe
    return result.rows[0].updated ? this.findById(id) : null;
  },

  async applyCleanup({ updates, deleteIds }) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const update of updates) {
        await client.query(
          `UPDATE training_images
           SET label = $2, ingredient_id = $3
           WHERE id = $1`,
          [update.id, update.label, update.ingredientId],
        );
      }

      if (deleteIds.length) {
        await client.query('DELETE FROM training_images WHERE id = ANY($1::uuid[])', [deleteIds]);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    return { updated: updates.length, deleted: deleteIds.length };
  },
};
