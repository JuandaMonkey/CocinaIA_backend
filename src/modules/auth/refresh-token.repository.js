import { query } from '../../config/database.js';

// función para convertir el resultado de la base de datos en un objeto refresh token
function mapRefreshToken(row) {
  return {
    id: row.id,
    userId: row.user_id,
    tokenHash: row.token_hash,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
    createdAt: row.created_at,
    userAgent: row.user_agent,
    ipAddress: row.ip_address,
  };
}

// función para convertir el resultado de la base de datos en un objeto de sesión activa
function mapSession(row) {
  return {
    id: row.id,
    userId: row.user_id,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    userAgent: row.user_agent,
    ipAddress: row.ip_address,
  };
}

// repositorio para manejar los refresh tokens
export const refreshTokenRepository = {
  // llamamos a la función para guardar un nuevo refresh token
  async create(data) {
    // ejecutamos la función de la base de datos para registrar el refresh token
    const result = await query('SELECT fn_create_refresh_token($1, $2, $3, $4, $5) AS id', [
      data.userId,
      data.tokenHash,
      data.expiresAt,
      data.userAgent ?? null,
      data.ipAddress ?? null,
    ]);

    // regresamos el id generado junto con los datos almacenados
    return { id: result.rows[0].id, ...data };
  },

  // llamamos a la función para buscar un refresh token válido por su hash
  async findValidByHash(tokenHash) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT * FROM fn_get_valid_refresh_token($1)', [tokenHash]);

    // regresamos el refresh token si existe o null si no fue encontrado
    return result.rows[0] ? mapRefreshToken(result.rows[0]) : null;
  },

  // llamamos a la función para revocar un refresh token usando su hash
  async revokeByHash(tokenHash) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT fn_revoke_refresh_token($1) AS revoked', [tokenHash]);

    // regresamos si el refresh token fue revocado correctamente
    return result.rows[0].revoked;
  },

  // llamamos a la función para obtener las sesiones activas de un usuario
  async findActiveByUser(userId) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT * FROM fn_get_active_refresh_tokens_by_user($1)', [userId]);

    // convertimos los registros en objetos de sesión
    return result.rows.map(mapSession);
  },

  // llamamos a la función para revocar una sesión específica del usuario
  async revokeByIdForUser(id, userId) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT fn_revoke_refresh_token_by_id($1, $2) AS revoked', [
      id,
      userId,
    ]);

    // regresamos si la sesión fue revocada correctamente
    return result.rows[0].revoked;
  },

  // llamamos a la función para revocar todas las sesiones activas del usuario
  async revokeAllForUser(userId) {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT fn_revoke_all_refresh_tokens_by_user($1) AS revoked_count', [
      userId,
    ]);

    // regresamos la cantidad de sesiones revocadas
    return Number(result.rows[0].revoked_count);
  },

  // llamamos a la función para eliminar los refresh tokens expirados
  async deleteExpired() {
    // ejecutamos la función de la base de datos
    const result = await query('SELECT fn_delete_expired_refresh_tokens() AS deleted_count');

    // regresamos la cantidad de registros eliminados
    return Number(result.rows[0].deleted_count);
  },
};