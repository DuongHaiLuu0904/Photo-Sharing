const express = require("express");
const router = express.Router();

const multer = require('multer')
const upload = multer()

const controller = require("../controllers/photo.controller");
const uploadCloud = require("../middlewares/uploadCloud.middleware");
const authentication = require("../middlewares/authentication.middleware");


// GET /photosOfUser/:id - Trả về tất cả ảnh của một người dùng với comments
router.get("/photosOfUser/:id", authentication.requireAuth, controller.photosOfUser);

// POST /commentsOfPhoto/:photo_id - Thêm bình luận vào ảnh
router.post("/commentsOfPhoto/:photo_id", authentication.requireAuth, controller.addComment);

// POST /new - Upload photo to Cloudinary for current logged in user
router.post("/new", authentication.requireAuth, upload.single('photo'), uploadCloud.upload, controller.uploadPhoto);

// POST /upload - Upload photo to Cloudinary (legacy route)
// router.post("/upload", upload.single('photo'), uploadCloud.upload, controller.uploadPhoto);

module.exports = router;
