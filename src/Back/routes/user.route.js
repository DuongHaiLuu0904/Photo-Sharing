const express = require("express");
const router = express.Router();

const controller = require("../controllers/user.controller");
const authentication = require("../middlewares/authentication.middleware");

// POST /user - Register a new user (no authentication required)
router.post("/", controller.register);

// GET /user/list - Trả về danh sách người dùng cho navigation sidebar
router.get("/list", authentication.requireAuth, controller.list);

// GET /user/:id - Trả về thông tin chi tiết của một người dùng
router.get("/:id", authentication.requireAuth, controller.detail);

router.patch("/:id", authentication.requireAuth, controller.update);

module.exports = router;