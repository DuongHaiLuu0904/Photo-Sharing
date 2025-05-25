const express = require("express");
const router = express.Router();

const controller = require("../controllers/admin.controller");

// POST /admin/login
router.post("/login", controller.login);

// POST /admin/logout
router.post("/logout", controller.logout);

// GET /admin/session 
router.get("/session", controller.checkSession);

module.exports = router;
