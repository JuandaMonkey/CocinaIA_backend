import pg from 'pg';

import { env } from './env.js';

const { Pool } = pg;

// creamos el pool de conexiones para postgres
export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: {
    rejectUnauthorized: true,
  },
});

// ejecutamos consultas sql usando el pool compartido
export async function query(text, params = []) {
  // enviamos la consulta parametrizada a postgres
  const result = await pool.query(text, params);

  // regresamos el resultado completo para que cada repositorio decida que usar
  return result;
}
