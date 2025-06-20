var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const status = require("express-status-monitor");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
// require("./gemini/gemini");
// require('./gemini/ImageProcessing');
// const {
//   appendFileContent,
//   copyFile,
//   createDirectory,
//   createFile,
//   createZip,
//   readFile,
//   readFileInStream,
//   removeDirectory,
//   removeFile,
//   saveFileFromUrl
// } = require("./gemini/stream");
// require("./gemini/GitFeatures");
// require("./gemini/CodeExecution");
// require("./gemini/UserInput");
// require("./gemini/ReadImageContent");
require("./gemini/ProcessPdf");
var app = express();
app.use(status());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
