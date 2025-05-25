const User = require('../models/user.model');

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

        // Store user info in session
        req.session.user = {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            login_name: user.login_name
        };

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
    if (!req.session.user) {
        return res.status(400).json({ error: "No user is currently logged in" });
    }

    req.session.destroy((err) => {
        if (err) {
            console.error("Logout error:", err);
            return res.status(500).json({ error: "Failed to logout" });
        }
        res.clearCookie('connect.sid'); // Clear session cookie
        res.json({ message: "Logged out successfully" });
    });
}

module.exports.checkSession = (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ error: "No user logged in" });
    }
}