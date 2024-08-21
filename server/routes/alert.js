const express = require("express");
const router = express.Router();

const alertController = require("../controllers/alert");
const { ROLES } = require("../config/constants.js");
const { checkRoles } = require("../middlewares/checkRole.js");

router.get("/", alertController.getAll);
router.post("/pushAlert", checkRoles([ROLES.ADMIN]), alertController.pushAlert);
router.get("/updateAlert", alertController.update);
router.get("/getCount", alertController.getUncheckedAlert);

module.exports = router;
