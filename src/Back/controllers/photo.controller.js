const Photo = require('../models/photo.model');
const User = require('../models/user.model');

// GET /photosOfUser/:id 
module.exports.photosOfUser = async (request, response) => {
    try {
        const userId = request.params.id;

        // Kiểm tra xem user có tồn tại không
        const userExists = await User.findById(userId);
        if (!userExists) {
            return response.status(400).json({ message: "User not found" });
        }

        // Lấy tất cả ảnh của user
        const photos = await Photo.find({ user_id: userId }, {
            _id: 1,
            user_id: 1,
            file_name: 1,
            date_time: 1,
            comments: 1
        }).sort({ date_time: -1 });

        // Xử lý từng ảnh và comments
        const photosWithComments = await Promise.all(photos.map(async (photo) => {
            // Xử lý comments của mỗi ảnh
            const commentsWithUserInfo = await Promise.all(photo.comments.map(async (comment) => {
                // Lấy thông tin user cho mỗi comment
                const commentUser = await User.findById(comment.user_id, {
                    _id: 1,
                    first_name: 1,
                    last_name: 1
                });

                return {
                    comment: comment.comment,
                    date_time: comment.date_time,
                    _id: comment._id,
                    user: commentUser ? {
                        _id: commentUser._id,
                        first_name: commentUser.first_name,
                        last_name: commentUser.last_name
                    } : null
                };
            }));

            // Trả về đối tượng ảnh với format yêu cầu
            return {
                _id: photo._id,
                user_id: photo.user_id,
                file_name: photo.file_name,
                date_time: photo.date_time,
                comments: commentsWithUserInfo
            };
        }));

        response.status(200).json(photosWithComments);
    } catch (error) {
        console.error("Error fetching photos of user:", error);
        response.status(500).json({ message: "Internal server error" });
    }
}

// POST /new  
module.exports.uploadPhoto = async (request, response) => {
    try {
        // Get user from session instead of request body
        const userId = request.session.user._id;
        
        // Check if user exists
        const userExists = await User.findById(userId);
        if (!userExists) {
            return response.status(400).json({ message: "User not found" });
        }

        // Check if file was uploaded and processed by middleware
        if (!request.body.photo) {
            return response.status(400).json({ message: "No photo uploaded or upload failed" });
        }

        // Create new photo document
        const newPhoto = new Photo({
            file_name: request.body.photo, // This will be the Cloudinary URL
            user_id: userId,
            date_time: new Date(),
            comments: []
        });

        const savedPhoto = await newPhoto.save();

        response.status(201).json({
            message: "Photo uploaded successfully",
            photo: {
                _id: savedPhoto._id,
                file_name: savedPhoto.file_name,
                user_id: savedPhoto.user_id,
                date_time: savedPhoto.date_time,
                comments: savedPhoto.comments
            }
        });

    } catch (error) {
        console.error("Error uploading photo:", error);
        response.status(500).json({ message: "Internal server error" });
    }
}

// POST /commentsOfPhoto/:photo_id
module.exports.addComment = async (request, response) => {
    try {
        const photoId = request.params.photo_id;
        const { comment } = request.body;
        const userId = request.session.user._id; // Lấy user từ session

        // Kiểm tra comment không được rỗng
        if (!comment || comment.trim() === '') {
            return response.status(400).json({ error: "Comment cannot be empty" });
        }

        // Kiểm tra photo có tồn tại không
        const photo = await Photo.findById(photoId);
        if (!photo) {
            return response.status(404).json({ error: "Photo not found" });
        }

        // Lấy thông tin user để đính kèm vào comment
        const user = await User.findById(userId, {
            _id: 1,
            first_name: 1,
            last_name: 1
        });

        if (!user) {
            return response.status(400).json({ error: "User not found" });
        }

        // Tạo comment mới
        const newComment = {
            comment: comment.trim(),
            date_time: new Date(),
            user_id: userId
        };

        // Thêm comment vào photo
        photo.comments.push(newComment);
        await photo.save();

        // Trả về comment mới với thông tin user
        const responseComment = {
            comment: newComment.comment,
            date_time: newComment.date_time,
            _id: photo.comments[photo.comments.length - 1]._id, // MongoDB tự tạo _id cho subdocument
            user: {
                _id: user._id,
                first_name: user.first_name,
                last_name: user.last_name
            }
        };

        response.status(201).json(responseComment);

    } catch (error) {
        console.error("Error adding comment:", error);
        response.status(500).json({ error: "Internal server error" });
    }
}