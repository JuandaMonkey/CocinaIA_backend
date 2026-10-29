import { AppError } from '../../shared/errors/app-error.js';
import { passwordService } from '../../shared/services/password.service.js';
import { userRepository } from './user.repository.js';

// servicio para manejar los usuarios
export const userService = {
  // llamamos al repositorio para obtener todos los usuarios
  async listUsers() {
    return userRepository.findAll();
  },

  // llamamos al repositorio para obtener un usuario por su id
  async getUser(id) {
    const user = await userRepository.findById(id);

    if (!user) {
      // si el usuario no existe, lanzamos un error
      throw new AppError('User not found', 404);
    }

    return user;
  },

  // llamamos al repositorio para crear un usuario
  async createUser(data) {
    // verificamos que el correo no esté registrado
    const existingUser = await userRepository.findByEmail(data.email);

    if (existingUser) {
      // si el correo ya existe, lanzamos un error
      throw new AppError('User email already exists', 409);
    }

    // generamos el hash de la contraseña
    const passwordHash = await passwordService.hash(data.password);

    return userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role ?? 'user',
    });
  },

  // llamamos al repositorio para actualizar un usuario
  async updateUser(id, data) {
    // verificamos que el correo no esté registrado por otro usuario
    const existingUser = await userRepository.findByEmail(data.email);

    if (existingUser && existingUser.id !== id) {
      // si el correo ya existe, lanzamos un error
      throw new AppError('User email already exists', 409);
    }

    const user = await userRepository.update(id, data);

    if (!user) {
      // si el usuario no existe, lanzamos un error
      throw new AppError('User not found', 404);
    }

    return user;
  },

  // llamamos al repositorio para eliminar un usuario
  async deleteUser(id) {
    const deleted = await userRepository.delete(id);

    if (!deleted) {
      // si el usuario no existe, lanzamos un error
      throw new AppError('User not found', 404);
    }
  },
};