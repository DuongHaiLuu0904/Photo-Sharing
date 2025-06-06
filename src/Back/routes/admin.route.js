const express = require("express");
const router = express.Router();

const controller = require("../controllers/admin.controller");
const { requireAuth } = require("../middlewares/authentication.middleware");

// POST /admin/login
router.post("/login", controller.login);

// POST /admin/logout
router.post("/logout", controller.logout);

// GET /admin/session - protected route
router.get("/session", requireAuth, controller.checkSession);

module.exports = router;
