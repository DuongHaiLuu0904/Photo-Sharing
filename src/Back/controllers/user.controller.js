const User = require("../models/user.model");

module.exports.list = async (req, res) => {
    try {
        // Chỉ lấy các trường cần thiết cho sidebar: _id, first_name, last_name
        const users = await User.find({}, { _id: 1, first_name: 1, last_name: 1 }).sort({ last_name: 1, first_name: 1 });

        // Tạo đối tượng JavaScript mới để tránh vấn đề với Mongoose models
        const userList = users.map(user => ({
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name
        }));

        res.status(200).json(userList);
    } catch (error) {
        console.error("Error fetching user list:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


module.exports.detail = async (req, res) => {
    try {
        const userId = req.params.id;

        // Lấy thông tin user với các trường cần thiết cho detail view
        const user = await User.findById(userId, {
            _id: 1,
            first_name: 1,
            last_name: 1,
            location: 1,
            description: 1,
            occupation: 1
        });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Tạo đối tượng JavaScript mới
        const userDetail = {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            location: user.location,
            description: user.description,
            occupation: user.occupation
        };

        res.status(200).json(userDetail);
    } catch (error) {
        console.error("Error fetching user detail:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports.register = async (req, res) => {
    try {
        const { login_name, password, first_name, last_name, location, description, occupation } = req.body;

        // Validate required fields
        if (!login_name || !password || !first_name || !last_name) {
            return res.status(400).json({ error: "login_name, password, first_name, and last_name are required and must be non-empty strings" });
        }

        // Check if login_name is a non-empty string
        if (typeof login_name !== 'string' || login_name.trim() === '') {
            return res.status(400).json({ error: "login_name must be a non-empty string" });
        }

        // Check if password is a non-empty string
        if (typeof password !== 'string' || password.trim() === '') {
            return res.status(400).json({ error: "password must be a non-empty string" });
        }

        // Check if first_name is a non-empty string
        if (typeof first_name !== 'string' || first_name.trim() === '') {
            return res.status(400).json({ error: "first_name must be a non-empty string" });
        }

        // Check if last_name is a non-empty string
        if (typeof last_name !== 'string' || last_name.trim() === '') {
            return res.status(400).json({ error: "last_name must be a non-empty string" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ login_name: login_name });
        if (existingUser) {
            return res.status(400).json({ error: "User with this login_name already exists" });
        }

        // Create new user
        const newUser = new User({
            login_name: login_name.trim(),
            password: password, // In a real app, you should hash this password
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            location: location ? location.trim() : '',
            description: description ? description.trim() : '',
            occupation: occupation ? occupation.trim() : ''
        });

        const savedUser = await newUser.save();

        // Return user info (excluding password)
        res.status(201).json({
            _id: savedUser._id,
            login_name: savedUser.login_name,
            first_name: savedUser.first_name,
            last_name: savedUser.last_name,
            location: savedUser.location,
            description: savedUser.description,
            occupation: savedUser.occupation
        });

    } catch (error) {
        console.error("Error creating user:", error);
        if (error.code === 11000) { // MongoDB duplicate key error
            return res.status(400).json({ error: "User with this login_name already exists" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports.update = async (req, res) => {
    try {
        const userId = req.params.id;
        const { first_name, last_name, location, description, occupation } = req.body;

        // Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update user fields
        user.first_name = first_name.trim();
        user.last_name = last_name.trim();
        user.location = location ? location.trim() : '';
        user.description = description ? description.trim() : '';
        user.occupation = occupation ? occupation.trim() : '';

        const updatedUser = await user.save();

        res.status(200).json({
            _id: updatedUser._id,
            first_name: updatedUser.first_name,
            last_name: updatedUser.last_name,
            location: updatedUser.location,
            description: updatedUser.description,
            occupation: updatedUser.occupation
        });

    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}