import { query } from '../../config/database.js';

// función para convertir el resultado de la base de datos en un objeto usuario
function mapUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

// función para convertir el resultado de la base de datos en un usuario con contraseña
function mapUserWithPassword(row) {
  return {
    ...mapUser(row),
    passwordHash: row.password_hash,
  };
}

// repositorio para manejar los usuarios
export const userRepository = {
  // llamamos a la función para obtener todos los usuarios
  async findAll() {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT * FROM fn_get_users()');

    // convertimos los registros en objetos de usuario
    return result.rows.map(mapUser);
  },

  // llamamos a la función para obtener un usuario por su id
  async findById(id) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT * FROM fn_get_user_by_id($1)', [id]);

    // regresamos el usuario si existe o null si no fue encontrado
    return result.rows[0] ? mapUser(result.rows[0]) : null;
  },

  // llamamos a la función para obtener un usuario por su correo
  async findByEmail(email) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT * FROM fn_get_user_by_email($1)', [email]);

    // regresamos el usuario si existe o null si no fue encontrado
    return result.rows[0] ? mapUser(result.rows[0]) : null;
  },

  // llamamos a la función para obtener un usuario con su contraseña
  async findByEmailWithPassword(email) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT * FROM fn_get_user_with_password_by_email($1)', [email]);

    // regresamos el usuario con la contraseña si existe o null si no fue encontrado
    return result.rows[0] ? mapUserWithPassword(result.rows[0]) : null;
  },

  // llamamos a la función para crear un usuario
  async create(data) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT fn_create_user($1, $2, $3, $4) AS id', [
      data.name,
      data.email,
      data.passwordHash,
      data.role ?? 'user',
    ]);

    // regresamos el usuario creado
    return this.findById(result.rows[0].id);
  },

  // llamamos a la función para actualizar un usuario
  async update(id, data) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT fn_update_user($1, $2, $3, $4, $5) AS updated', [
      id,
      data.name,
      data.email,
      data.role ?? null,
      data.isActive ?? null,
    ]);

    // regresamos el usuario actualizado o null si no existe
    return result.rows[0].updated ? this.findById(id) : null;
  },

  // llamamos a la función para eliminar un usuario
  async delete(id) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT fn_delete_user($1) AS deleted', [id]);

    // regresamos si el usuario fue eliminado correctamente
    return result.rows[0].deleted;
  },
};