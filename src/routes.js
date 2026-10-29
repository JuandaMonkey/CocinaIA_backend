import { Router } from 'express';

import { authRouter } from './modules/auth/auth.routes.js';
import { globalModelRouter } from './modules/global-models/global-model.routes.js';
import { ingredientRouter } from './modules/ingredients/ingredient.routes.js';
import { kitchenModelRouter } from './modules/kitchen-models/kitchen-model.routes.js';
import { kitchenPreferenceRouter } from './modules/kitchen-preferences/kitchen-preference.routes.js';
import { kitchenRouter } from './modules/kitchens/kitchen.routes.js';
import { pantryRouter } from './modules/pantry/pantry.routes.js';
import { recipeHistoryRouter } from './modules/recipe-history/recipe-history.routes.js';
import { recipeLearningModelRouter } from './modules/recipe-learning-models/recipe-learning-model.routes.js';
import { recipeRouter } from './modules/recipes/recipe.routes.js';
import { trainingImageRouter } from './modules/training-images/training-image.routes.js';
import { userRouter } from './modules/users/user.routes.js';
import { authenticate } from './shared/middlewares/authenticate.js';

// creamos el router principal de la api
export const apiRouter = Router();

// ruta informativa de la api
apiRouter.get('/', (_req, res) => {
  res.json({
    message: 'Cocina Inteligente API',
    version: '0.1.0',
  });
});

// dejamos auth publico para login, registro y refresh
apiRouter.use('/auth', authRouter);

// protegemos todas las rutas siguientes con jwt
apiRouter.use(authenticate);

// modelos visuales globales para reconocimiento de ingredientes
apiRouter.use('/global-models', globalModelRouter);

// catalogo de ingredientes disponibles
apiRouter.use('/ingredients', ingredientRouter);

// cocinas del usuario y administracion de acceso
apiRouter.use('/kitchens', kitchenRouter);

// modelos visuales asociados a cocinas especificas
apiRouter.use('/kitchen-models', kitchenModelRouter);

// preferencias usadas para personalizar recomendaciones
apiRouter.use('/kitchen-preferences', kitchenPreferenceRouter);

// alacena e inventario por cocina
apiRouter.use('/pantry', pantryRouter);

// recetas creadas, iniciadas y finalizadas por los usuarios
apiRouter.use('/recipe-history', recipeHistoryRouter);

// snapshots globales, por usuario y por cocina del aprendizaje de recetas
apiRouter.use('/recipe-learning-models', recipeLearningModelRouter);

// recetas base del sistema
apiRouter.use('/recipes', recipeRouter);

// imagenes que alimentan el dataset visual
apiRouter.use('/training-images', trainingImageRouter);

// administracion de usuarios
apiRouter.use('/users', userRouter);
