const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema(
    {
        file_name: { type: String },
        date_time: { type: Date, default: Date.now },
        user_id: mongoose.Schema.Types.ObjectId,
        comments: [{
            comment: String,
            date_time: { type: Date, default: Date.now },
            user_id: mongoose.Schema.Types.ObjectId,
        }],
    },
    { timestamps: true }
);

const Photo = mongoose.model("Photo", photoSchema, 'photos');
module.exports = Photo;