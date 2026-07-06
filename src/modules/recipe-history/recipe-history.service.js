import { kitchenAccessService } from '../../shared/services/kitchen-access.service.js';
import { cloudinaryService } from '../../shared/services/cloudinary.service.js';
import { recipeHistoryRepository } from './recipe-history.repository.js';

// servicio para manejar el historial de recetas
export const recipeHistoryService = {
  // llamamos al repositorio para obtener el historial de una cocina
  async listHistory(user, kitchenId) {
    // verificamos que el usuario tenga acceso a la cocina
    await kitchenAccessService.assertCanAccessKitchen(user, kitchenId);

    return recipeHistoryRepository.findByUser(user.sub);
  },

  // llamamos al repositorio para crear un registro en el historial
  async createHistory(user, data) {
    // verificamos que el usuario tenga acceso a la cocina
    await kitchenAccessService.assertCanAccessKitchen(user, data.kitchenId);

    return recipeHistoryRepository.create({ ...data, userId: user.sub });
  },

  // llamamos al repositorio para obtener un registro del historial por su id
  async getHistory(user, historyId) {
    const history = await recipeHistoryRepository.findById(historyId);

    // verificamos que el usuario tenga acceso a la cocina
    await kitchenAccessService.assertCanAccessKitchen(user, history?.kitchenId);

    return history;
  },

  // llamamos al repositorio para obtener estadísticas del historial
  async getInsights(user, kitchenId) {
    // verificamos que el usuario tenga acceso a la cocina
    await kitchenAccessService.assertCanAccessKitchen(user, kitchenId);

    return recipeHistoryRepository.getInsights(kitchenId);
  },

  // llamamos al repositorio para iniciar una receta del historial
  async startHistory(user, historyId) {
    // obtenemos la cocina asociada al historial
    const kitchenId = await recipeHistoryRepository.findKitchenIdById(historyId);

    // verificamos que el usuario tenga acceso a la cocina
    await kitchenAccessService.assertCanAccessKitchen(user, kitchenId);

    await recipeHistoryRepository.start(historyId);

    return { id: historyId, status: 'in_progress' };
  },

  // llamamos al repositorio para finalizar una receta del historial
  async finishHistory(user, historyId) {
    // obtenemos la cocina asociada al historial
    const kitchenId = await recipeHistoryRepository.findKitchenIdById(historyId);

    // verificamos que el usuario tenga acceso a la cocina
    await kitchenAccessService.assertCanAccessKitchen(user, kitchenId);

    await recipeHistoryRepository.finish(historyId);

    try {
      await this.rebuildRecipeModels(user.sub, kitchenId);
    } catch (error) {
      console.error('recipe learning model update failed', error);
    }

    return { id: historyId, status: 'finished' };
  },

  // llamamos al repositorio para actualizar los modelos de recetas
  async rebuildRecipeModels(userId, kitchenId) {
    // reconstruimos los modelos global, usuario y cocina
    const models = await recipeHistoryRepository.rebuildRecipeLearningModels(userId, kitchenId);

    // subimos cada snapshot json a cloudinary
    await Promise.all(
      models.map(async (model) => {
        const uploadResult = await cloudinaryService.uploadJson(
          model.version,
          model.modelData,
          { folder: `cocina-inteligente/recipe-models/${model.scope}` },
        );

        await recipeHistoryRepository.setRecipeLearningModelUrl(model.id, uploadResult.secure_url);
      }),
    );

    return models;
  },

  // llamamos al repositorio para repetir una receta guardada
  async repeatHistory(user, historyId, kitchenId) {
    // obtenemos la cocina asociada a la receta original
    const sourceKitchenId = await recipeHistoryRepository.findKitchenIdById(historyId);

    // verificamos que el usuario tenga acceso a la receta original
    await kitchenAccessService.assertCanAccessKitchen(user, sourceKitchenId);

    // verificamos que el usuario tenga acceso a la cocina donde va a cocinar
    await kitchenAccessService.assertCanAccessKitchen(user, kitchenId);

    const newHistoryId = await recipeHistoryRepository.repeat(historyId, kitchenId, user.sub);

    return { id: newHistoryId, status: 'in_progress' };
  },

  // llamamos al repositorio para eliminar un registro del historial
  async deleteHistory(user, historyId) {
    // obtenemos la cocina asociada al historial
    const kitchenId = await recipeHistoryRepository.findKitchenIdById(historyId);

    // verificamos que el usuario tenga acceso a la cocina
    await kitchenAccessService.assertCanAccessKitchen(user, kitchenId);

    return recipeHistoryRepository.delete(historyId);
  },
};
