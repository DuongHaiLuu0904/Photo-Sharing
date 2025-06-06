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
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
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


app.listen(8000, () => {
    console.log(`🚀 Server listening on port ${8000}`);
});
