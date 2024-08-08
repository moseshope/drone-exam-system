const express = require("express");
const router = express.Router();
const referencesController = require("../controllers/references");
const { ROLES } = require("../config/constants");
const { checkRoles } = require("../middlewares/checkRole");
const upload = require("../middlewares/references");

router.get("/", referencesController.getAll);
router.post("/add", upload, referencesController.add);
router.get("/del", referencesController.del);
router.post("/update", upload, referencesController.update);

module.exports = router;
