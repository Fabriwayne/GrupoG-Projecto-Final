import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;

const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: 'Authorization header missing or invalid' });
        }

        jwt.verify(token, SECRET, (error, decoded) => {
            if (error) {
                return res.status(401).json({ message: 'Invalid token or expired'});
            }

            req.user = decoded;

            next();
        });
        
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate' });
    }
};

// Igual que verifyToken, pero si no hay sesión (o es inválida) deja pasar la petición sin req.user
const optionalAuth = (req, res, next) => {
    const token = req.cookies?.token;

    if (token) {
        try {
            req.user = jwt.verify(token, SECRET);
        } catch {
            // token inválido o vencido: se trata como visitante
        }
    }

    next();
};

export { verifyToken, optionalAuth, SECRET };