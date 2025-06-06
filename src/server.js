const express = require("express");
const app = express();

const cors = require("cors");
const path = require("path");
const session = require("express-session");

const dbConnect = require("./Back/config/Connect");

const UserRouter = require("./Back/routes/user.route");
const PhotoRouter = require("./Back/routes/photo.route");
const AdminRouter = require("./Back/routes/admin.route");

dbConnect();

app.use(
  cors({
    origin: "https://thw6p3-3000.csb.app",
    credentials: true,
  })
);

app.use(express.json());

// Session configuration
app.use(
  session({
    secret: "photo-sharing-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use("/images", express.static(path.join(__dirname, "../public/images")));

app.use("/admin", AdminRouter);

app.use("/user", UserRouter);
app.use("/photo", PhotoRouter);

app.get("/", (request, response) => {
  response.send({ message: "Hello from photo-sharing app API!" });
});

app.listen(8080, () => {
  console.log("server listening on port 8080");
});
