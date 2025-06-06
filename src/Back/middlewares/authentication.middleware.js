const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET ||
  (() => {
    console.warn(
      "⚠️  JWT_SECRET not found in environment variables! Using default secret for development."
    );
    return "your-super-secret-jwt-key-change-in-production";
  })();

module.exports.requireAuth = (req, res, next) => {
  console.log("🔍 Auth middleware called for:", req.path);
  console.log("🔍 Request cookies:", req.headers.cookie);
  console.log("🔍 Authorization header:", req.headers.authorization);

  // Ưu tiên Authorization header cho CodeSandbox
  let token = null;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.substring(7);
    console.log("🔍 Token found in Authorization header");
  }
  // Fallback: kiểm tra cookie auth_token
  else if (req.cookies && req.cookies.auth_token) {
    token = req.cookies.auth_token;
    console.log("🔍 Token found in auth_token cookie");
  }
  // Fallback: kiểm tra cookie jwt (cũ)
  else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
    console.log("🔍 Token found in jwt cookie");
  }

  if (!token) {
    console.log("❌ No token provided");
    return res.status(401).json({ error: "Unauthorized - Please login first" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    console.log("✅ Token verified for user:", decoded.login_name);
    next();
  } catch (error) {
    console.error("❌ JWT verification failed:", error.message);
    return res
      .status(401)
      .json({ error: "Invalid token - Please login again" });
  }
};

module.exports.generateToken = (user) => {
  const payload = {
    id: user._id.toString(), // Convert ObjectId to string
    login_name: user.login_name,
    first_name: user.first_name,
    last_name: user.last_name,
    is_admin: user.is_admin || false,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};
