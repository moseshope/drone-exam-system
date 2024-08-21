const Alert = require("../models/alert");
const User = require("../models/userModel");

exports.getAll = async (req, res) => {
    const user = req.user._id;
    try {
        const alerts = await Alert.find({ user: user, isChecked: false })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            alerts,
        });
    } catch (error) {
        console.error("Error fetching alerts:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch alerts. Please try again later.",
        });
    }
};

exports.getUncheckedAlert = async (req, res) => {
    const user = req.user._id;
    try {
        const count = await Alert
            .find({ user: user, isChecked: false })
            .countDocuments();

        return res.status(200).json({
            success: true,
            count,
        });
    } catch (error) {
        console.error("Error counting unchecked alerts:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to count unchecked alerts. Please try again later.",
        });
    }
};

exports.pushAlert = async (req, res) => {
    const { title, content } = req.body;
    try {
        const users = await User.find();
        const alertPromises = users.map(user => {
            const newAlert = new Alert({
                title,
                content,
                isChecked: false,
                user: user._id,
            });
            return newAlert.save();
        });

        await Promise.all(alertPromises);

        return res.status(200).json({
            success: true,
            message: `${users.length} alerts created.`,
        });
    } catch (error) {
        console.error("Error creating alerts:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create alerts. Please try again later.",
        });
    }
};

exports.update = async (req, res) => {
    try {
        const user = req.user._id;
        const result = await Alert.updateMany(
            { user: user, isChecked: false },
            { isChecked: true }
        );

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("Error updating alerts:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update alerts. Please try again later.",
        });
    }
};
