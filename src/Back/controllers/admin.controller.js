const User = require("../models/user.model");
const { generateToken } = require("../middlewares/authentication.middleware");

module.exports.login = async (req, res) => {
  try {
    console.log("🔍 Login request received:", req.body);
    const { login_name, password } = req.body;

    if (!login_name || !password) {
      return res
        .status(400)
        .json({ error: "login_name and password are required" });
    }

    const user = await User.findOne({ login_name: login_name });
    console.log(
      "🔍 User found:",
      user ? `${user.first_name} ${user.last_name}` : "Not found"
    );

    if (!user || user.password !== password) {
      console.log("❌ Login failed: Invalid credentials");
      return res.status(400).json({ error: "Invalid login_name or password" });
    }

    // Generate JWT token
    const token = generateToken(user);
    console.log("✅ JWT token created for:", user.login_name);

    // Vẫn set cookie (fallback) nhưng cũng trả token trong response
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
      domain: ".csb.app",
    });

    console.log("✅ Login successful for:", user.login_name);

    // Trả token trong response để frontend có thể lưu vào localStorage
    res.json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      login_name: user.login_name,
      token: token, // Thêm token vào response
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.logout = (req, res) => {
  console.log("🔍 Logout request received");

  // Clear cookie
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    domain: ".csb.app",
  });

  console.log("✅ Logged out successfully");
  res.json({ message: "Logged out successfully" });
};

module.exports.checkSession = (req, res) => {
  console.log("🔍 Check session called");
  console.log("🔍 Request cookies:", req.headers.cookie);
  console.log("🔍 Authorization header:", req.headers.authorization);

  // Kiểm tra token từ cookie trước
  let token = req.cookies.auth_token;

  // Nếu không có cookie, kiểm tra Authorization header
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    console.log("❌ No token found");
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const jwt = require("jsonwebtoken");
    const JWT_SECRET =
      process.env.JWT_SECRET ||
      "your-super-secret-jwt-key-change-in-production";
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("✅ Token valid for:", decoded.login_name);
    res.json(decoded);
  } catch (error) {
    console.log("❌ Invalid token:", error.message);
    res.status(401).json({ error: "Invalid token" });
  }
};
