const express = require("express");
const router = express.Router();

const dbController = require("../controllers/db.js");

router.get("/", dbController.getAll);
router.post("/backup", dbController.backup);
router.get(
  "/delDB",
  dbController.delDB
);
router.post("/restore", dbController.restore);

module.exports = router;
