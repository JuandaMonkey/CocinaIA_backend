import bcrypt from 'bcryptjs';

// número de rondas utilizadas para generar el hash
const saltRounds = 10;

// servicio para manejar el cifrado de contraseñas
export const passwordService = {
  // llamamos a bcrypt para generar el hash de la contraseña
  hash(password) {
    return bcrypt.hash(password, saltRounds);
  },

  // llamamos a bcrypt para comparar una contraseña con su hash
  compare(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
  },
};