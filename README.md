# GrupoG-Projecto-Final
# LMS — Plataforma de Aprendizaje en Línea

Proyecto final · Grupo G · Metodologías Ágiles con Scrum

Plataforma web básica de aprendizaje en línea: los **profesores** publican cursos con lecciones y los **estudiantes** los consultan y avanzan a su propio ritmo. El equipo está en `Integrantes.txt` y el trabajo se organiza en 4 sprints semanales, con el tablero en GitHub Projects.

## Estado del proyecto

| Funcionalidad | Estado |
|---|---|
| Registro, inicio y cierre de sesión | ✅ Listo |
| Perfil (ver y editar los datos de la cuenta) | ✅ Listo |
| Dashboard del profesor (sus cursos) | ✅ Listo |
| Crear, editar y eliminar cursos (con portada) | ✅ Listo |
| Crear, editar y eliminar lecciones (con enlace de video opcional) | ✅ Listo |
| Capítulos y materiales de apoyo (PDF, DOC, PPT) en las lecciones | ✅ Listo |
| Inscripción de estudiantes a cursos (y dashboard del estudiante) | ✅ Listo |
| Progreso del estudiante (lecciones completadas) | ✅ Listo |
| Quizzes (crear, publicar, tomar y ver resultados) | ✅ Listo |
| Cambio y recuperación de contraseña | ⏳ Pendiente (los formularios existen, falta el backend) |

## Tecnologías

**Backend:** Node.js, Express 5, MongoDB con Mongoose 9, autenticación con JWT guardado en una cookie `httpOnly`, bcryptjs, Multer y Cloudinary (portadas de los cursos y materiales de las lecciones).

**Frontend:** React 19, Vite 8, React Router 7 y Tailwind CSS 4.

## Requisitos

- Node.js **20.19 o superior**
- MongoDB (local o en MongoDB Atlas)
- Una cuenta de Cloudinary (para subir las y materiales de las lecciones)

## Cómo ejecutarlo

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env     # en Windows: copy .env.example .env
# abre .env y completa los valores (ver la tabla de abajo)
npm run dev
```

| Variable | Para qué sirve | Ejemplo |
|---|---|---|
| `PORT` | Puerto del servidor. El frontend lo espera en 5000 por defecto | `5000` |
| `MONGO_URI` | Cadena de conexión a MongoDB | `mongodb://localhost:27017/LMS_Basic` |
| `JWT_SECRET` | Clave con la que se firman las sesiones (mínimo 32 caracteres aleatorios) | *genérala, no la compartas* |
| `CLIENT_URL` | Dirección del frontend que puede llamar al backend (CORS) | `http://localhost:5173` |
| `CLOUDINARY_CLOUD_NAME` | Datos de tu cuenta de Cloudinary | |
| `CLOUDINARY_API_KEY` | | |
| `CLOUDINARY_API_SECRET` | | |

Para generar un `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> El archivo `.env` **nunca se sube a git** (ya está en `.gitignore`).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

Si tu backend no corre en `http://localhost:5000`, crea `frontend/.env` con:

```
VITE_API_URL=http://localhost:5000
```

(el nombre debe empezar por `VITE_`; reinicia `npm run dev` después de cambiarlo).

### Scripts útiles

| Carpeta | Comando | Qué hace |
|---|---|---|
| `backend` | `npm run dev` | Servidor con reinicio automático (nodemon) |
| `backend` | `npm start` | Servidor normal |
| `frontend` | `npm run dev` | Servidor de desarrollo de Vite |
| `frontend` | `npm run build` | Genera la versión de producción |
| `frontend` | `npm run lint` | Revisa el código con ESLint |

## API

Las sesiones viajan en una cookie, así que el frontend envía `credentials: "include"`. Los roles son `student` y `teacher`.

| Método | Ruta | Quién puede |
|---|---|---|
| POST | `/api/auth/register` | Público |
| POST | `/api/auth/login` | Público |
| POST | `/api/auth/logout` | Público |
| GET · PUT | `/api/auth/me` | Usuario con sesión |
| GET | `/api/courses` | Público (solo cursos publicados) |
| GET | `/api/courses/catalog` | Público (cursos publicados) |
| GET | `/api/courses/:id` | Público si el curso está publicado; los borradores solo los ven su profesor y los estudiantes inscritos |
| GET | `/api/courses/mine` | Profesor |
| POST | `/api/courses` (con imagen opcional) | Profesor |
| PUT · DELETE | `/api/courses/:id` | Profesor dueño del curso (al borrarlo se eliminan también sus capítulos, lecciones, quizzes e inscripciones) |
| PATCH | `/api/courses/:id/status` | Profesor dueño del curso (`draft` / `published`) |
| GET | `/api/chapters/course/:courseId` | Profesor dueño o estudiante inscrito |
| POST | `/api/chapters` | Profesor dueño del curso |
| PUT · DELETE | `/api/chapters/:id` | Profesor dueño del curso (no se puede borrar un capítulo con lecciones) |
| GET | `/api/lessons/course/:courseId` | Profesor dueño o estudiante inscrito |
| GET | `/api/lessons/:id/resources/:index` | Profesor dueño o estudiante inscrito (PDF en el navegador; DOC/PPT se descargan) |
| POST | `/api/lessons` (con archivos opcionales) | Profesor dueño del curso |
| PUT · DELETE | `/api/lessons/:id` | Profesor dueño del curso |
| GET | `/api/enrollments/mine` | Estudiante |
| POST | `/api/enrollments/:courseId` | Estudiante |
| POST | `/api/enrollments/:courseId/lessons/:lessonId/complete` | Estudiante inscrito |
| POST · PUT · DELETE | `/api/quizzes`, `/api/quizzes/:id` | Profesor dueño del curso |
| GET | `/api/quizzes/teacher/course/:courseId`, `/api/quizzes/teacher/:id` | Profesor dueño del curso |
| GET | `/api/quizzes/course/:courseId` | Estudiante inscrito (quizzes publicados, sin respuestas correctas) |
| POST | `/api/quiz-attempts/:quizId/submit` | Estudiante inscrito |
| GET | `/api/quiz-attempts/:quizId/mine` | Estudiante inscrito |

## Estructura

```
backend/
  src/
    config/        conexión a MongoDB y a Cloudinary
    controllers/   lógica de cada recurso (auth, usuarios, cursos, capítulos, lecciones, inscripciones, quizzes)
    middlewares/   verificación de sesión, de rol y subida de archivos
    models/        esquemas de Mongoose (User, Course, Chapter, Lesson, Enrollment, Quiz, QuizAttempt)
    routes/        qué URL llama a qué controlador
    utils/         funciones de apoyo (subida y borrado de archivos en Cloudinary)
    app.js         arranque del servidor
frontend/
  src/
    components/    piezas de interfaz reutilizables
    pages/         una pantalla por ruta
    services/      comunicación con el backend (api.js es la base compartida)
```