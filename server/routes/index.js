const express = require("express");
require("../config/passport");

const router = express.Router();

const authRouter = require("./auth");
const userRouter = require("./user");
const planRouter = require("./plan");
const problemsRouter = require("./problems");
const examRouter = require("./exam");
const dbRouter = require("./db");
const refRouter = require("./references");
const alertRouter = require("./alert");

const authMiddleware = require("../middlewares/auth");

const { jwtAuth } = authMiddleware;

router.get("/", (req, res) => {
  return res.json({
    message: "This is API interface",
  });
});

router.use("/auth", authRouter);
router.use("/users", jwtAuth, userRouter);
router.use("/plans", jwtAuth, planRouter);
router.use("/problems", jwtAuth, problemsRouter);
router.use("/exams", jwtAuth, examRouter);
router.use("/db", dbRouter);
router.use("/references", jwtAuth, refRouter);
router.use("/alert", jwtAuth, alertRouter);

module.exports = router;
