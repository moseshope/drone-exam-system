const alert = require("../models/alert");

exports.getAll = async (req, res) => {
    try {
        const alerts = await alert.find()
            .find({ isChecked: false })
            .sort({ createdAt: -1 })
        return res.status(200).json({
            success: true,
            alerts,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getUncheckedAlert = async (req, res) => {
    try {
        const count = await alert
            .find({ isChecked: false }) // Filter documents where isChecked is false
            .countDocuments();          // Count the number of documents

        return res.status(200).json({
            success: true,
            count,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


exports.pushAlert = async (req, res) => {
    const { title, content } = req.body;
    try {
        const newAlert = new alert({
            title: title,
            content: content,
            isChecked: false 
        });

        await newAlert.save();

        return res.status(200).json({
            success: true,
            reference: newAlert,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.update = async (req, res) => {
    try {
        const result = await alert.updateMany(
            { isChecked: false }, // Filter to match documents where isChecked is false
            { isChecked: true }    // Update operation
        );

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


