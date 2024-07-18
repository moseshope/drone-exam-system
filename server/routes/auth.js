const express = require("express");

const router = express.Router();

const authController = require("../controllers/auth");
const authMiddleware = require("../middlewares/auth");

const { jwtLogin } = authMiddleware;

router.get("/", (req, res) => {
    res.json({
        message: "This is auth API interface",
    });
});

router.post("/register", authController.register);
router.post("/login", jwtLogin, authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/vierfy-link", authController.verifyResetLink);
router.post("/reset-password", authController.resetPassword);
router.post("/addNewUser", authController.addNewUser);

module.exports = router;
