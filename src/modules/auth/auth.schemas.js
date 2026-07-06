import { z } from 'zod';

// esquema para validar el registro de un usuario
export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(150),
    password: z.string().min(8).max(100),
  }),
});

// esquema para validar el inicio de sesión
export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email().max(150),
    password: z.string().min(8).max(100),
  }),
});

// esquema para validar el refresh token
export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().trim().min(40),
  }),
});

// reutilizamos el esquema para validar el cierre de sesión
export const logoutSchema = refreshSchema;

// esquema para validar el id de una sesión
export const sessionIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});