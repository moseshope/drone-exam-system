const express = require("express");
const router = express.Router();

const problemController = require("../controllers/problems.js");
const { ROLES } = require("../config/constants.js");
const { checkRoles } = require("../middlewares/checkRole.js");

router.get("/", checkRoles([ROLES.ADMIN]), problemController.getAllProblems);
router.get("/getProblems", problemController.getProblems);
router.get(
  "/getProblemCount",
  checkRoles([ROLES.ADMIN]),
  problemController.getProblemCount
);
router.post(
  "/addProblem",
  checkRoles([ROLES.ADMIN]),
  problemController.addProblem
);
router.get(
  "/updateProblem",
  checkRoles([ROLES.ADMIN]),
  problemController.updateProblem
);
router.get(
  "/deleteProblem",
  checkRoles([ROLES.ADMIN]),
  problemController.deleteProblem
);

module.exports = router;
