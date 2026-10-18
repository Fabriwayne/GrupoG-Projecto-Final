import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { SECRET } from '../middlewares/authMiddleware.js';

const ROLES_PERMITIDOS = ['student', 'teacher'];

const registerUser = async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Solo texto: evita que lleguen objetos (por ejemplo {"$ne": null}) a las consultas
    if ([username, email, password, role].some((v) => typeof v !== 'string')) {
        return res.status(400).json({ message: 'Invalid data' });
    }

    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    if (!ROLES_PERMITIDOS.includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const usernameTaken = await User.findOne({ username: username.trim() });
        if (usernameTaken) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await User.create({
            username: username.trim(),
            email: email.trim(),
            role,
            password: hashedPassword
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Username already taken' });
        }
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Find the user by email
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            SECRET,
            { expiresIn: '1h' });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "lax",
            maxAge: 60 * 60 * 1000, // misma duración que el token (1 hora)
        });

        res.status(200).json({
            message: 'User logged in successfully',
            user: {
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in user', error: error.message });
    }
};

const logoutUser = (req, res) => {
    res.clearCookie("token");

    res.json({
        message: "Logout successful"
    });
};

// Cambiar contraseña desde el perfil
const changePassword = async (req, res) => {
    const { passwordActual, nuevoPassword } = req.body;

    try {
        // El ID del usuario viene del middleware verifyToken (req.user.id)
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        // 1. Verificar si la contraseña actual es correcta
        const isMatch = await bcrypt.compare(passwordActual, user.password);
        if (!isMatch) return res.status(400).json({ message: 'La contraseña actual es incorrecta' });

        // 2. Encriptar e inyectar la nueva contraseña
        user.password = await bcrypt.hash(nuevoPassword, 10);
        await user.save();

        res.status(200).json({ message: 'Contraseña actualizada con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al cambiar la contraseña', error: error.message });
    }
};

// Solicitar recuperación (Generar Token)
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) return res.status(404).json({ message: 'No existe una cuenta con ese correo' });

        // Crear un token aleatorio único
        const token = crypto.randomBytes(20).toString('hex');

        // El token expira en 1 hora (3600000 milisegundos)
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        res.status(200).json({
            message: 'Token generado con éxito. En producción se enviará por correo.',
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Error en la solicitud', error: error.message });
    }
};

// Restablecer contraseña con el Token de la URL
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { nuevaContraseña } = req.body;

    try {
        // Buscar un usuario que tenga el token válido y que no haya expirado
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } // $gt significa "mayor que la hora actual"
        });

        if (!user) return res.status(400).json({ message: 'El token de recuperación es inválido o ha expirado' });

        // Cambiar la contraseña y limpiar los campos del token de la sesión
        user.password = await bcrypt.hash(nuevaContraseña, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.status(200).json({ message: 'Tu contraseña ha sido restablecida correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al restablecer la contraseña', error: error.message });
    }
};

export {
    registerUser,
    loginUser,
    logoutUser,
    changePassword,
    forgotPassword,
    resetPassword
};