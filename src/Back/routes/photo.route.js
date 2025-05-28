const express = require("express");
const router = express.Router();

const multer = require('multer')
const upload = multer()

const controller = require("../controllers/photo.controller");
const uploadCloud = require("../middlewares/uploadCloud.middleware");
const authentication = require("../middlewares/authentication.middleware");


router.get("/photosOfUser/:id", authentication.requireAuth, controller.photosOfUser);

router.post("/commentsOfPhoto/:photo_id", authentication.requireAuth, controller.addComment);


router.post("/new", authentication.requireAuth, upload.single('photo'), uploadCloud.upload, controller.uploadPhoto);

module.exports = router;
