import { asyncHandler } from '../../shared/middlewares/async-handler.js';
import { authService } from './auth.service.js';

// función para obtener información de la solicitud
function getRequestMeta(req) {
  return {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  };
}

// controlador para manejar la autenticación
export const authController = {
  // llamamos al servicio para registrar un usuario
  register: asyncHandler(async (req, res) => {
    const auth = await authService.register(req.validated.body, getRequestMeta(req));
    res.status(201).json({ data: auth });
  }),

  // llamamos al servicio para iniciar sesión
  login: asyncHandler(async (req, res) => {
    const auth = await authService.login(req.validated.body, getRequestMeta(req));
    res.json({ data: auth });
  }),

  // llamamos al servicio para renovar el access token
  refresh: asyncHandler(async (req, res) => {
    const auth = await authService.refresh(req.validated.body, getRequestMeta(req));
    res.json({ data: auth });
  }),

  // llamamos al servicio para cerrar la sesión
  logout: asyncHandler(async (req, res) => {
    await authService.logout(req.validated.body);
    res.status(204).send();
  }),

  // llamamos al servicio para obtener las sesiones activas del usuario
  sessions: asyncHandler(async (req, res) => {
    const sessions = await authService.listSessions(req.user);
    res.json({ data: sessions });
  }),

  // llamamos al servicio para revocar una sesión específica
  revokeSession: asyncHandler(async (req, res) => {
    await authService.revokeSession(req.user, req.validated.params.id);
    res.status(204).send();
  }),

  // llamamos al servicio para cerrar todas las sesiones activas
  logoutAll: asyncHandler(async (req, res) => {
    const revokedCount = await authService.logoutAll(req.user);
    res.json({ data: { revokedCount } });
  }),

  // llamamos al servicio para eliminar las sesiones expiradas
  cleanupExpired: asyncHandler(async (_req, res) => {
    const deletedCount = await authService.cleanupExpiredSessions();
    res.json({ data: { deletedCount } });
  }),
};