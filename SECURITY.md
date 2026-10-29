# Política y Medidas de Seguridad - Cocina Inteligente

Este documento detalla las medidas y prácticas de seguridad implementadas en el backend de **Cocina Inteligente** para proteger los datos de los usuarios, las sesiones de conexión y la integridad del sistema.

---

## 1. Medidas de Seguridad Implementadas

El backend incorpora múltiples capas de defensa para mitigar riesgos y vulnerabilidades comunes en aplicaciones web modernas:

### A. Autenticación y Control de Sesiones
- **JSON Web Tokens (JWT):** Se emplean firmas de tokens seguros para autenticar las peticiones entrantes mediante el encabezado `Authorization: Bearer <token>`.
- **Acceso Expirable y Rotación de Sesión:** Los tokens de acceso tienen una vida corta. Se utiliza un esquema de **Refresh Tokens** de un solo uso guardados en la base de datos para renovar las sesiones, lo que minimiza el impacto en caso de secuestro de tokens (Session Hijacking).
- **Revocación de Sesión:** Los usuarios pueden invalidar sus sesiones activas de manera individual o masiva (logout en todos los dispositivos), lo que destruye el refresh token en la base de datos.
- **Autorización por Roles:** El middleware de autorización asegura que rutas administrativas críticas (como la limpieza de tokens expirados o la activación de modelos globales) solo puedan ser consumidas por usuarios con rol de administrador (`admin`).

### B. Seguridad de Transporte y Encabezados (HTTP)
- **Helmet:** Este middleware está configurado para establecer encabezados HTTP orientados a la seguridad, ayudando a proteger la aplicación contra vulnerabilidades conocidas como:
  - Inyección de scripts no autorizados (XSS).
  - Secuestro de click (Clickjacking).
  - Descargas maliciosas basadas en sniffing de tipos MIME (`X-Content-Type-Options`).
- **CORS (Cross-Origin Resource Sharing):** Protege la API limitando el consumo de recursos desde orígenes web no autorizados.
- **Límite de Peticiones (Rate Limiting):** Para prevenir ataques de denegación de servicio (DDoS) o de fuerza bruta (especialmente en rutas críticas como `/auth/login`), se limita la cantidad de solicitudes provenientes de una misma IP a un máximo de **300 peticiones cada 15 minutos**.

### C. Protección de Datos y Prevención de Inyecciones
- **Validación con Zod:** Todas las rutas expuestas pasan por esquemas estrictos de validación con **Zod** (`validateRequest`). Si los parámetros de ruta, cuerpo de la petición (`body`) o consulta no cumplen con los tipos de datos requeridos, la solicitud es rechazada de inmediato.
- **Consultas Parametrizadas (PostgreSQL):** La interacción con la base de datos se realiza a través de consultas parametrizadas encapsuladas en funciones almacenadas de PostgreSQL (`fn_*`), eliminando la posibilidad de ataques por inyección SQL.
- **Cifrado de Contraseñas:** Las contraseñas de los usuarios nunca se guardan en texto plano; se utiliza **bcryptjs** para generar hashes seguros antes de persistir los datos en base de datos.

### D. Seguridad en la Subida de Archivos
- **Filtro de Tipos de Archivo:** El middleware de carga de archivos (`uploadImage` y `uploadModelFiles` basados en **Multer**) valida los tipos MIME en memoria. Solo se permiten imágenes seguras (`image/jpeg`, `image/png`, `image/webp`).
- **Límites de Tamaño de Archivo:** Se aplican restricciones estrictas de peso de archivo (máximo 2MB para JSON de modelos y 5MB para imágenes) para evitar ataques de agotamiento de recursos o desbordamiento en memoria.

---
