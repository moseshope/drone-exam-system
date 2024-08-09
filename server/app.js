const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const cors = require("cors");
const path = require("path");
const http = require("http");
const dayjs = require("dayjs");
const morgan = require("morgan");
const { scheduleJob } = require("node-schedule");
const chalk = require("chalk");
const bodyParser = require('body-parser');
const config = require("./config");
const socketIO = require("./socket");
const webhook = require("./controllers/webhook");
const api = require("./routes");
const UserModel = require("./models/userModel");
const { _log, _error } = require("./utils/logging");
const cron = require('node-cron');
const { backup } = require("./controllers/db")


// const sharp = require("sharp");
// const request = require('request');

mongoose
  .connect(config.MongoURL)
  .then(async () => {
    await UserModel.updateMany({}, { $set: { socketId: [] } });
    _log("MONGODB connected!");
  })
  .catch(_error);

const app = express();

const server = http.createServer(app);

socketIO.init(server);

app.set("io", socketIO.getSocketIO());

app.set("view engine", "ejs");

app.use(cors({ origin: "*" }));
app.use(morgan("dev"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(passport.initialize());

app.use(express.static(`${__dirname}/public`));

app.use("/api", api);

app.get("/*", function (req, res) {
  res.sendFile(path.resolve(__dirname, "public/index.html"));
});

app.use(bodyParser.json({ limit: '1gb' }));
app.use(bodyParser.urlencoded({ limit: '1gb', extended: true }));

// Handle errors.
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({ error: err });
});

cron.schedule('0 0 * * 0', () => {
  console.log('Running scheduled backup...');
  backup();
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  _log(`Server is running on port`, PORT);
});

const job = scheduleJob("* * * * *", () => {
  _log("Running", dayjs().format("YYYY-MM-DD HH:mm:ss"));
});
