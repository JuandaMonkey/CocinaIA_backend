import crypto from 'node:crypto';

// función para generar un identificador único
export function createId() {
  // llamamos a crypto para generar un uuid
  return crypto.randomUUID();
}