const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET
})

let streamUpload = (buffer) => {
    return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
            if (result) {
                resolve(result);
            } else {
                reject(error);
            }
        })

        streamifier.createReadStream(buffer).pipe(stream);
    })
}

const uploadToCloudinary = async (buffer) => {
    let result = await streamUpload(buffer)
    return result.url
}

module.exports = { uploadToCloudinary };

