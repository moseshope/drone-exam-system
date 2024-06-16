
const jwt = require("jsonwebtoken");

const config = require("../config");
const User = require("../models/userModel");
const { _log, _error } = require("../utils/logging");
const PasswordResetTokensModel = require("../models/passwordResetTokens");
const { generateToken, sendEmail, verifyToken, sendNotification } = require("../utils/helpers");

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const { utm_source, utm_capmaign, utm_medium, utm_content } = req.query;

        const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Create a case-insensitive regular expression with the escaped email
        const emailRegex = new RegExp(`^${escapedEmail}$`, 'i');

        const existUser = await User.findOne({ email: emailRegex });
        if (existUser) {
            let message = "This email has already been taken.";

            if (existUser.status == 2) {
                message = "This user deleted account manually. If you want to active this account, please contact to support.";
            }
            return res.status(422).json({
                success: false,
                errors: {
                    email: message,
                },
            });
        }

        const user = new User({
            name,
            email,
            password,
            utm_source,
            utm_capmaign,
            utm_medium,
            utm_content,
        });

        await user.save();

        const newUser = {
            id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.permission == 1,
        };

        const access_token = jwt.sign(newUser, config.SecretKey, {
            expiresIn: config.TOKEN_EXPIRES_IN,
        });
        // sendEmail({
        //     from: process.env.FROM_ADDRESS,
        //     to: user.email,
        //     subject: "Welcome to RealtyGenius.AI",
        //     html: 'welcome',
        //     data: {
        //         name: user.name
        //     }
        // });
        sendNotification("New user registered!");
        return res.status(200).json({
            success: true,
            user: newUser,
            token: `jwt ${access_token}`,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
        });
    }
};

exports.login = async (req, res) => {
    if (req.user.status == 2) {
        return res.status(422).json({
            success: false,
            errors: {
                email: "This user deleted account manually. If you want to active this account, please contact to support.",
            },
        });
    }

    const user = {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        stripeId: req.user.stripeId,
        avatar: req.user.avatar,
        isAdmin: req.user.permission == 1,
    };

    const access_token = jwt.sign(user, config.SecretKey, {
        expiresIn: config.TOKEN_EXPIRES_IN,
    });

    return res.status(200).json({
        success: true,
        user,
        token: `jwt ${access_token}`,
    });
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Create a case-insensitive regular expression with the escaped email
        const emailRegex = new RegExp(`^${escapedEmail}$`, 'i');

        const user = await User.findOne({ email: emailRegex });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found!"
            });
        }

        const token = generateToken(user._id);

        await new PasswordResetTokensModel({
            userId: user._id,
            token
        }).save();

        const resetUrl = `${config.APP_URL}reset-password/${token}`;
        sendEmail({
            from: process.env.FROM_ADDRESS,
            to: user.email,
            subject: "Reset Password Notification",
            html: 'forgotPassword',
            data: {
                name: user.name,
                resetUrl,
            }
        });

        return res.json({
            success: true,
            message: "We have emailed your password reset link."
        });

    } catch (error) {
        _error("auth:forgotPassword", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong!"
        });
    }
}

exports.verifyResetLink = async (req, res) => {
    try {
        const token = req.body.token;
        const data = verifyToken(token);

        if (!data) {
            return res.status(400).json({
                success: false,
                message: "Invalid or Expired Password Reset Link. Please send forgot password email again.",
            });
        }

        const userId = data.id;

        const existToken = await PasswordResetTokensModel.findOne({
            userId,
            token
        });

        if (!existToken) {
            return res.status(400).json({
                success: false,
                message: "Invalid or Expired Password Reset Link. Please send forgot password email again.",
            });
        }

        return res.json({
            success: true,
            message: "Valid token",
        });

    } catch (error) {
        _error(error);
        return res.status(5000).json({
            success: false,
            message: "Something went wrong!",
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { password, token } = req.body;

        const data = verifyToken(token);

        if (!data) {
            return res.status(400).json({
                success: false,
                message: "Invalid or Expired Password Reset Link. Please send forgot password email again.",
            });
        }

        const userId = data.id;

        const existToken = await PasswordResetTokensModel.findOne({
            userId,
            token
        });

        if (!existToken) {
            return res.status(400).json({
                success: false,
                message: "Invalid or Expired Password Reset Link. Please send forgot password email again.",
            });
        }

        const user = await User.findById(userId);

        user.password = password;

        await user.save();

        await existToken.remove();

        return res.json({
            success: true,
            message: "Successfully reset!"
        });

    } catch (error) {
        _error("auth:resetPassword", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong!"
        });
    }
}