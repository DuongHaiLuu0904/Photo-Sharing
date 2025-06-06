const User = require('../models/user.model');
const { generateToken } = require('../middlewares/authentication.middleware');

module.exports.login = async (req, res) => {
    try {
        console.log('Login request received:', req.body);
        const { login_name, password } = req.body;

        if (!login_name) {
            console.log('Login failed: login_name is required');
            return res.status(400).json({ error: "login_name is required" });
        }

        if (!password) {
            console.log('Login failed: password is required');
            return res.status(400).json({ error: "password is required" });
        }

        // Find user by login_name
        const user = await User.findOne({ login_name: login_name });
        console.log('User found:', user ? `${user.first_name} ${user.last_name}` : 'Not found');

        if (!user) {
            console.log('Login failed: Invalid login_name');
            return res.status(400).json({ error: "Invalid login_name or password" });
        }

        // Check password (in a real app, you should use bcrypt to compare hashed passwords)
        if (user.password !== password) {
            console.log('Login failed: Invalid password');
            return res.status(400).json({ error: "Invalid login_name or password" });
        }

        // Generate JWT token
        const token = generateToken(user);
        
        // Set JWT token as HTTP-only cookie
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        console.log('Login successful for:', user.login_name);

        // Return user info (excluding sensitive data)
        res.json({
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            login_name: user.login_name
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports.logout = (req, res) => {
    // Clear JWT cookie
    res.clearCookie('jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    res.json({ message: "Logged out successfully" });
}

module.exports.checkSession = (req, res) => {
    // User is available from JWT middleware
    if (req.user) {
        res.json({
            _id: req.user.id,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            login_name: req.user.login_name
        });
    } else {
        res.status(401).json({ error: "No user logged in" });
    }
}