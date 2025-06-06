const express = require("express");
require('dotenv').config(); // Load environment variables from .env file
const app = express();

const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");

const dbConnect = require("./Back/config/Connect");

const UserRouter = require("./Back/routes/user.route");
const PhotoRouter = require("./Back/routes/photo.route");
const AdminRouter = require("./Back/routes/admin.route");

dbConnect();

app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://codesandbox.io', /https:\/\/.*\.csb\.app$/, /https:\/\/.*\.codesandbox\.io$/] 
        : (process.env.FRONTEND_URL || 'http://localhost:3000'),
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use('/images', express.static(path.join(__dirname, '../public/images')));

app.use("/admin", AdminRouter);

app.use("/user", UserRouter);
app.use("/photo", PhotoRouter);

app.get("/", (request, response) => {
    response.send({ message: "Hello from photo-sharing app API!" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? 'Loaded from .env' : 'Using default (not secure for production)'}`);
});
