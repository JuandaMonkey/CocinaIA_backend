import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

import { env } from '../../config/env.js';

// servicio para manejar tokens de autenticacion
export const tokenService = {
  // generamos un access token firmado con jwt
  sign(payload) {
    return jwt.sign(payload, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn,
    });
  },

  // verificamos y decodificamos un access token
  verify(token) {
    return jwt.verify(token, env.jwtSecret);
  },

  // generamos un refresh token aleatorio
  createRefreshToken() {
    return crypto.randomBytes(64).toString('hex');
  },

  // guardamos solo el hash del refresh token en base de datos
  hashRefreshToken(refreshToken) {
    return crypto.createHash('sha256').update(refreshToken).digest('hex');
  },
};
