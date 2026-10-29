import { AppError } from '../../shared/errors/app-error.js';
import { env } from '../../config/env.js';
import { passwordService } from '../../shared/services/password.service.js';
import { tokenService } from '../../shared/services/token.service.js';
import { userRepository } from '../users/user.repository.js';
import { userService } from '../users/user.service.js';
import { refreshTokenRepository } from './refresh-token.repository.js';

// creamos un access token con datos minimos del usuario
function createAccessToken(user) {
  return tokenService.sign({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
}

// creamos un refresh token y guardamos solo su hash
async function createRefreshToken(user, requestMeta = {}) {
  const refreshToken = tokenService.createRefreshToken();
  const tokenHash = tokenService.hashRefreshToken(refreshToken);
  const expiresAt = new Date();

  // calculamos la expiracion segun configuracion
  expiresAt.setDate(expiresAt.getDate() + env.refreshTokenExpiresDays);

  // guardamos la sesion para poder revocarla despues
  await refreshTokenRepository.create({
    userId: user.id,
    tokenHash,
    expiresAt,
    userAgent: requestMeta.userAgent,
    ipAddress: requestMeta.ipAddress,
  });

  return refreshToken;
}

// construimos la respuesta estandar de autenticacion
async function createAuthResponse(user, requestMeta = {}) {
  const accessToken = createAccessToken(user);
  const refreshToken = await createRefreshToken(user, requestMeta);

  // regresamos usuario y tokens al frontend
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
    token: accessToken,
  };
}

// servicio para manejar registro, login y sesiones
export const authService = {
  // registramos usuarios nuevos siempre como usuario normal
  async register(data, requestMeta) {
    const user = await userService.createUser({
      ...data,
      role: 'user',
    });

    return createAuthResponse(user, requestMeta);
  },

  // validamos credenciales e iniciamos sesion
  async login(data, requestMeta) {
    const user = await userRepository.findByEmailWithPassword(data.email);

    if (!user) {
      // evitamos revelar si el correo existe o no
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      // bloqueamos usuarios desactivados por administrador
      throw new AppError('User is disabled', 403);
    }

    // comparamos la contraseña contra el hash guardado
    const isValidPassword = await passwordService.compare(data.password, user.passwordHash);

    if (!isValidPassword) {
      // usamos el mismo mensaje para no filtrar informacion
      throw new AppError('Invalid email or password', 401);
    }

    // regresamos una sesion nueva
    return createAuthResponse(user, requestMeta);
  },

  // renovamos access token usando refresh token
  async refresh(data, requestMeta) {
    const tokenHash = tokenService.hashRefreshToken(data.refreshToken);
    const storedRefreshToken = await refreshTokenRepository.findValidByHash(tokenHash);

    if (!storedRefreshToken) {
      // rechazamos refresh tokens inexistentes, revocados o vencidos
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // buscamos el usuario dueño de la sesion
    const user = await userRepository.findById(storedRefreshToken.userId);

    if (!user) {
      // detenemos el flujo si el usuario ya no existe
      throw new AppError('User not found', 404);
    }

    // rotamos el refresh token para reducir reutilizacion indebida
    await refreshTokenRepository.revokeByHash(tokenHash);

    return createAuthResponse(user, requestMeta);
  },

  // cerramos una sesion especifica
  async logout(data) {
    const tokenHash = tokenService.hashRefreshToken(data.refreshToken);
    await refreshTokenRepository.revokeByHash(tokenHash);
  },

  // listamos sesiones activas del usuario
  listSessions(user) {
    return refreshTokenRepository.findActiveByUser(user.sub);
  },

  // revocamos una sesion activa por id
  async revokeSession(user, sessionId) {
    const revoked = await refreshTokenRepository.revokeByIdForUser(sessionId, user.sub);

    if (!revoked) {
      // avisamos si la sesion no pertenece al usuario o no existe
      throw new AppError('Session not found', 404);
    }
  },

  // cerramos todas las sesiones del usuario
  async logoutAll(user) {
    return refreshTokenRepository.revokeAllForUser(user.sub);
  },

  // eliminamos sesiones expiradas de la base de datos
  cleanupExpiredSessions() {
    return refreshTokenRepository.deleteExpired();
  },
};
