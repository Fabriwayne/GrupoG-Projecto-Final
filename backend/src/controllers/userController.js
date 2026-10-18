import User from '../models/userModel.js';

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUserById = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUserById = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
        res.json(user);
    } catch {
        res.status(500).json({ message: "Error al obtener el perfil" });
    }
}

const updateCurrentUser = async (req, res) => {
    try {
        const { username } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { username },
            { new: true, runValidators: true }
        ).select("-password");
        res.json(user);
    } catch (err) {
        const msg = err.code === 11000 ? "Ese nombre de usuario ya existe" : "Error al actualizar";
        res.status(400).json({ message: msg });
    }
}

export { getUserById, updateUserById, deleteUserById, getCurrentUser, updateCurrentUser };