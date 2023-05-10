require("./db/connect");
require("express-async-errors");

const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const path = require("path");

const bookshelf = require("./routes/bookshelfRoutes");
const user = require("./routes/authRoutes");
const edits = require("./routes/editRoutes");
const notFound = require("./middleware/not-found-middleware");
const errorHandlerMiddleware = require("./middleware/error-handler-middleware");
const authenticateUser = require("./middleware/auth-middleware");
const morgan = require("morgan");

const connectDB = require("./db/connect");
require("dotenv").config();

// security
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

// middleware
app.use(cookieParser(process.env.JWT_SECRET));
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);
app.use(morgan("tiny"));
app.use(express.json());
app.use(helmet());
app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://the-bookshelf-project.netlify.app"
  );
  next();
});
app.use(
  cors({
    credentials: true,
    origin: true,
    path: "/",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);
app.use(xss());

app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (req, res, next) {
  res.render("index.html");
});

// routes
app.use("/api/v1/auth", user);
app.use("/api/v1/bookshelf", authenticateUser, bookshelf);
app.use("/api/v1/edit", authenticateUser, edits);

// error handler middleware
app.use(errorHandlerMiddleware);
app.use(notFound);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Server is listening at port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
