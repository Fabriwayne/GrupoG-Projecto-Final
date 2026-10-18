import express from 'express';
import 'dotenv/config';
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express();

const PORT = process.env.PORT || 3000;

import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import lessonRoutes from './routes/lessons.js';
import enrollmentRoutes from './routes/enrollment.js'
import chapterRoutes from './routes/chapter.js';
import quizRoutes from "./routes/quiz.js";
import quizAttemptRoutes from "./routes/quizAttempt.js";

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}))

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/chapters', chapterRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/quiz-attempts", quizAttemptRoutes);

// Manejo de errores: multer (subidas) y cualquier otro error no controlado
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'El archivo pesa demasiado. Máximo 5MB para imágenes y 10MB para materiales.' });
  }
  if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ message: 'Se enviaron más archivos de los permitidos.' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'El cuerpo de la petición no es un JSON válido.' });
  }
  if (err.name === 'MulterError' || err.message?.startsWith('Tipo de archivo no permitido')) {
    return res.status(400).json({ message: err.message });
  }

  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error('Error connecting to the database:', error);
});