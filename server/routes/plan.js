const express = require("express");

const planController = require("../controllers/plan");
const { isAdmin } = require("../middlewares/checkRole");

const router = express.Router();

router.get('/', planController.getAll);
router.get('/activePlan', planController.getActivePlan);
router.get('/getUserSubscription', planController.getUserSubscription);
router.post('/createSetupIntent', planController.createSetupIntent);
router.post('/createSubscription', planController.createSubscription);
router.put('/cancelSubscription', planController.cancelSubscription);
router.put('/continueSubscription', planController.continueSubscription);

module.exports = router;
