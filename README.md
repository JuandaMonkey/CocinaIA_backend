# Cocina Inteligente API

Este es el backend de **Cocina Inteligente**, una API RESTful desarrollada con Node.js, Express y PostgreSQL. Permite la administración de cocinas de usuarios, inventario de despensas (alacena), historial de recetas cocinadas, entrenamiento de imágenes para reconocimiento de ingredientes y la gestión de modelos personalizados de aprendizaje automático.

## Características Principales

- **Gestión de Autenticación y Sesiones:** Flujo seguro mediante JWT (tokens de acceso de corta duración y refresh tokens almacenados en base de datos). Permite listar sesiones activas y revocarlas individualmente o en su totalidad.
- **Administración de Despensa (Pantry):** Seguimiento del inventario de ingredientes por cocina, incluyendo cantidades, unidades de medida y fechas de vencimiento.
- **Historial de Recetas:** Registro del historial de cocina, calificación de recetas y control de estado de preparación.
- **Modelos de Aprendizaje Personalizados:** Integración de imágenes para entrenamiento y almacenamiento de archivos de modelos (redes neuronales/modelos clasificadores de ingredientes) asociados a cocinas específicas.
- **Integración con Cloudinary:** Almacenamiento seguro en la nube para imágenes de entrenamiento y archivos de modelos.
- **Documentación Interactiva:** Especificación completa de rutas y esquemas de datos integrada con **Swagger UI**.

---

## Estructura del Proyecto

El backend sigue un diseño modular y una arquitectura por capas bien definida:

```text
src/
├── app.js               # configuración y middleware de la aplicación express
├── server.js            # punto de arranque del servidor
├── routes.js            # enrutador principal de la api
├── config/              # configuraciones de base de datos, entorno, cloudinary y swagger
├── shared/              # utilidades, middlewares de uso general y manejo de errores globales
└── modules/             # módulos de negocio organizados por dominio
    ├── auth/            # autenticación, sesiones y tokens
    ├── users/           # administración de usuarios del sistema
    ├── kitchens/        # gestión de las cocinas del sistema
    ├── ingredients/     # catálogo maestro de ingredientes
    ├── pantry/          # inventario de las alacenas de las cocinas
    ├── recipes/         # recetas y recomendaciones iniciales
    ├── recipe-history/  # historial de preparaciones por cocina
    ├── global-models/   # modelos base compartidos por todas las cocinas
    ├── kitchen-models/  # modelos personalizados por cocina
    ├── training-images/ # urls de imágenes para el entrenamiento de modelos
    └── ...
```

Cada módulo de dominio sigue el flujo clásico de responsabilidad única por capas:
`routes (Rutas)` ➔ `controller (Controlador)` ➔ `service (Servicio)` ➔ `repository (Repositorio)`

---

## Requisitos Previos

Asegúrate de tener instalados los siguientes componentes antes de iniciar:

1. **Node.js** (versión v18 o superior recomendada).
2. **PostgreSQL** (configurado y accesible).
3. Una cuenta de **Cloudinary** para el almacenamiento de archivos e imágenes.

---

## Instalación y Configuración

Sigue estos pasos para levantar el entorno de desarrollo local:

### 1. Clonar e Instalar Dependencias
Accede a la carpeta del backend e instala los paquetes necesarios:
```bash
npm install
```

### 2. Configurar Variables de Entorno
Copia el archivo de ejemplo `.env.example` para crear tu `.env`:
```bash
cp .env.example .env
```
Abre el archivo `.env` recién creado y completa la información de configuración:
- `PORT`: Puerto en el que correrá el servidor (por defecto `3000`).
- `DATABASE_URL`: URL de conexión a tu base de datos de PostgreSQL.
- `JWT_SECRET`: Llave secreta para firmar los tokens JWT de sesión.
- Credenciales de **Cloudinary** (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, etc.).

### 3. Configurar e Inicializar la Base de Datos
Este script crea el esquema de las tablas necesarias, índices, restricciones y funciones SQL requeridas en la base de datos de PostgreSQL:
```bash
npm run db:setup
```

---

## Scripts Disponibles

En el directorio del proyecto puedes ejecutar los siguientes comandos:

- **`npm run dev`**: Inicia el servidor de desarrollo utilizando el modo watch nativo de Node.js (el servidor se recarga automáticamente al detectar cambios).
- **`npm start`**: Inicia el servidor de producción.
- **`npm run db:setup`**: Ejecuta la migración y configuración inicial del esquema y funciones SQL en PostgreSQL.
- **`npm run lint`**: Ejecuta el formateador y verificador de estilo de código de ESLint para asegurar la calidad de sintaxis.
- **`npm test`**: Ejecuta la suite de pruebas unitarias.

---

## Documentación de la API

Una vez que el servidor esté corriendo, puedes acceder a la documentación interactiva en formato **Swagger** para revisar todos los endpoints disponibles, parámetros aceptados y respuestas esperadas:

- **Swagger UI:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **JSON Spec:** [http://localhost:3000/api-docs.json](http://localhost:3000/api-docs.json)
