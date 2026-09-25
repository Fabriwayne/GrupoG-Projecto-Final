const checkRole = (roles) => {
    return (req, res, next) => {
        const userRole = req.user.role;
        if (userRole === 'teacher' || userRole === 'admin') {
            if (!roles.includes('teacher') && !roles.includes('admin')) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
        }

        if (!roles.includes(userRole)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        next();
    };
};

export default checkRole;