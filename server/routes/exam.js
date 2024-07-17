const express = require("express");
const router = express.Router();

const examController = require("../controllers/exam.js");
const { ROLES } = require("../config/constants.js");
const { checkRoles } = require("../middlewares/checkRole.js");

router.get("/", checkRoles([ROLES.ADMIN]), examController.getAllExam);
router.get(
  "/getLastExam",
  checkRoles([ROLES.ADMIN]),
  examController.getLastExam
);
router.post("/saveExam", examController.saveExam);
router.get("/getExamProblems", checkRoles([ROLES.ADMIN]), examController.getExamProblems);

module.exports = router;
