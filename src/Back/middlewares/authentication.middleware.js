const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || (() => {
    console.warn('⚠️  JWT_SECRET not found in environment variables! Using default secret for development.');
    return 'your-super-secret-jwt-key-change-in-production';
})();

module.exports.requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized - Please login first' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('JWT verification failed:', error.message);
        return res.status(401).json({ error: 'Invalid token - Please login again' });
    }
};

module.exports.generateToken = (user) => {
    const payload = {
        id: user._id,
        login_name: user.login_name,
        first_name: user.first_name,
        last_name: user.last_name,
        is_admin: user.is_admin || false
    };
    
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};