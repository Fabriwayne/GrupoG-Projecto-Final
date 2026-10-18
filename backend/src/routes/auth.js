import express from 'express';
const router = express.Router()
import { registerUser, loginUser, logoutUser, forgotPassword,
resetPassword,
changePassword } from "../controllers/authController.js";
import { verifyToken } from '../middlewares/authMiddleware.js';
import { getCurrentUser, updateCurrentUser } from '../controllers/userController.js';


router.post('/register', registerUser);

router.post('/login', loginUser);

router.post('/logout', logoutUser);

router.get("/me", verifyToken, getCurrentUser);

router.put("/me", verifyToken, updateCurrentUser);

// Flujo de recuperación (Público)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Cambio de contraseña (Privado - Requiere estar logueado)
router.put('/change-password', verifyToken, changePassword);

export default router;