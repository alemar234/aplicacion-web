# Gestor de Tareas Colaborativo

Una aplicación web para gestionar tareas de forma colaborativa, desarrollada con Node.js, Express y SQLite.

## Características

- ✅ Registro e inicio de sesión de usuarios
- 📝 Creación y gestión de listas de tareas
- 🤝 Compartir listas con otros usuarios
- 💬 Comentarios en tareas
- 🏷️ Sistema de etiquetas para clasificación

## Requisitos

- Node.js (versión 14 o superior)
- npm (incluido con Node.js)

## Instalación

1. Clona este repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
cd task-manager
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia la aplicación:
```bash
npm run dev
```

4. Abre tu navegador y visita `http://localhost:3000`

## Estructura del Proyecto

```
/
├── app.js           # Punto de entrada de la aplicación
├── data/           # Base de datos SQLite
├── models/         # Modelos y acceso a datos
├── controllers/    # Lógica de negocio
├── routes/         # Definición de rutas
├── views/          # Plantillas EJS
└── public/         # Archivos estáticos (CSS, JS, imágenes)
```

## Tecnologías Utilizadas

- Express.js - Framework web
- SQLite - Base de datos
- EJS - Motor de plantillas
- express-session - Manejo de sesiones
- better-sqlite3 - Cliente SQLite
- bcryptjs - Encriptación de contraseñas

## Desarrollo

Para ejecutar la aplicación en modo desarrollo con recarga automática:

```bash
npm run dev
``` 