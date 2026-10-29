// importamos el generador de documentación swagger
import swaggerJsdoc from 'swagger-jsdoc';

// definimos la especificación de swagger compilando los comentarios de las rutas
export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cocina Inteligente API',
      version: '0.1.0',
      description: 'API para administrar cocinas, ingredientes, inventario y recetas.',
    },
    security: [{ bearerAuth: [] }],
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Servidor local',
      },
    ],
    tags: [
      { name: 'Auth', description: 'Registro, login y token JWT' },
      { name: 'Health', description: 'Estado del servicio' },
      { name: 'Users', description: 'Usuarios basicos del sistema' },
      { name: 'Global Models', description: 'Modelos base compartidos por todas las cocinas' },
      { name: 'Ingredients', description: 'Catalogo de ingredientes' },
      { name: 'Kitchens', description: 'Cocinas de usuarios' },
      { name: 'Kitchen Models', description: 'Modelos personalizados por cocina' },
      { name: 'Kitchen Preferences', description: 'Preferencias usadas para recomendaciones' },
      { name: 'Pantry', description: 'Inventario de alacena' },
      { name: 'Recipe History', description: 'Historial de recetas cocinadas por cocina' },
      { name: 'Recipes', description: 'Recetas y recomendaciones iniciales' },
      { name: 'Training Images', description: 'URLs de imagenes para entrenar modelos' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      parameters: {
        IdParam: {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Usuario Demo' },
            email: { type: 'string', format: 'email', example: 'demo@cocina.com' },
            role: { type: 'string', enum: ['admin', 'user'], example: 'user' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateUserInput: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Usuario Demo' },
            email: { type: 'string', format: 'email', example: 'demo@cocina.com' },
            password: { type: 'string', format: 'password', example: 'password123' },
            role: { type: 'string', enum: ['admin', 'user'], example: 'user' },
          },
        },
        RegisterInput: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Usuario Demo' },
            email: { type: 'string', format: 'email', example: 'demo@cocina.com' },
            password: { type: 'string', format: 'password', example: 'password123' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'demo@cocina.com' },
            password: { type: 'string', format: 'password', example: 'password123' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            token: { type: 'string' },
          },
        },
        RefreshTokenInput: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string' },
          },
        },
        UpdateUserInput: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            name: { type: 'string', example: 'Usuario Demo' },
            email: { type: 'string', format: 'email', example: 'demo@cocina.com' },
          },
        },
        Ingredient: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Tomate' },
            category: { type: 'string', example: 'Verdura' },
            baseUnit: { type: 'string', example: 'pieza' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateIngredientInput: {
          type: 'object',
          required: ['name', 'category', 'baseUnit'],
          properties: {
            name: { type: 'string', example: 'Papa' },
            category: { type: 'string', example: 'Verdura' },
            baseUnit: { type: 'string', example: 'pieza' },
          },
        },
        UpdateIngredientInput: {
          type: 'object',
          required: ['name', 'category', 'baseUnit'],
          properties: {
            name: { type: 'string', example: 'Tomate' },
            category: { type: 'string', example: 'Verdura' },
            baseUnit: { type: 'string', example: 'pieza' },
          },
        },
        Kitchen: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Cocina principal' },
            ownerName: { type: 'string', example: 'Juan' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateKitchenInput: {
          type: 'object',
          required: ['userId', 'name'],
          properties: {
            userId: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Cocina principal' },
          },
        },
        PantryItem: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            kitchenId: { type: 'string', format: 'uuid' },
            ingredientId: { type: 'string', format: 'uuid' },
            quantity: { type: 'number', example: 4 },
            unit: { type: 'string', example: 'pieza' },
            expirationDate: { type: 'string', format: 'date', example: '2026-07-20' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        AddPantryItemInput: {
          type: 'object',
          required: ['kitchenId', 'ingredientId', 'quantity', 'unit'],
          properties: {
            kitchenId: { type: 'string', format: 'uuid' },
            ingredientId: { type: 'string', format: 'uuid' },
            quantity: { type: 'number', example: 4 },
            unit: { type: 'string', example: 'pieza' },
            expirationDate: { type: 'string', format: 'date', example: '2026-07-20' },
          },
        },
        UpdatePantryItemInput: {
          type: 'object',
          required: ['quantity', 'unit'],
          properties: {
            quantity: { type: 'number', example: 4 },
            unit: { type: 'string', example: 'pieza' },
            expirationDate: { type: 'string', format: 'date', nullable: true, example: '2026-07-20' },
          },
        },
        Recipe: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Arroz con tomate' },
            description: { type: 'string' },
            ingredientNames: {
              type: 'array',
              items: { type: 'string' },
            },
            missingStrategy: { type: 'string', example: 'suggest-shopping-list' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        TrainingImage: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            ingredientId: { type: 'string', format: 'uuid', nullable: true },
            ingredientName: { type: 'string', nullable: true, example: 'Tomate' },
            label: { type: 'string', example: 'Tomate' },
            imageUrl: {
              type: 'string',
              format: 'uri',
              example: 'https://res.cloudinary.com/demo/image/upload/tomate.jpg',
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        TrainingDatasetClass: {
          type: 'object',
          properties: {
            label: { type: 'string', example: 'Tomate' },
            ingredientId: { type: 'string', format: 'uuid', nullable: true },
            images: {
              type: 'array',
              items: { type: 'string', format: 'uri' },
            },
            count: { type: 'number', example: 12 },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            details: { type: 'object' },
          },
        },
      },
    },
  },
  apis: ['src/**/*.routes.js', 'src/app.js'],
});
