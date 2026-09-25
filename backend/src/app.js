import express from 'express';
const app = express();
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/db.js';

const PORT = process.env.PORT || 3000;  

import authRoutes from './routes/auth.js';

app.use(express.json());
app.use('/api/auth', authRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error('Error connecting to the database:', error);
});