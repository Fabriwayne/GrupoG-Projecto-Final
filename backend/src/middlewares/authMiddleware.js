import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;

const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Authorization header missing or invalid' });
        }

        jwt.verify(token, SECRET, (error, decoded) => {
            if (error) {
                return res.status(403).json({ message: 'Invalid token or expired'});
            }

            req.usuario = decoded;

            next();
        });
        
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate' });
    }
};

export { verifyToken, SECRET };