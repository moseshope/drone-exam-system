const references = require("../models/references");
const { delFile } = require("../utils/helpers");

exports.getAll = async (req, res) => {
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    try {
        const skip = (page - 1) * limit;
        const total = await references.countDocuments();
        const refs = await references.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        return res.status(200).json({
            success: true,
            refs,
            total,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.del = async (req, res) => {
    try {
        const { _id } = req.query; // Assuming the _id is passed as a URL parameter
        const result = await references.findByIdAndDelete(_id, {
            useFindAndModify: false, // Add this option to avoid deprecation warning
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Reference File not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Reference File successfully deleted",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete Reference",
        });
    }
};

exports.add = async (req, res) => {
    console.log(req.body);
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }

        const newReference = new references({
            fileName: file.originalname,
            dir: file.path.replace(/\\/g, "/").replace("public/", ""),
            description: req.body.description,
        });

        await newReference.save();

        return res.status(200).json({
            success: true,
            message: "Reference added successfully",
            reference: newReference,
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
        const file = req.file;
        const { _id, description } = req.body;
        let updatedReference;
        if(file) {
             updatedReference = await references.findByIdAndUpdate(_id, {
                fileName: file.originalname,
                dir: file.path.replace(/\\/g, "/").replace("public/", ""),
                description,
            }, { new: true, useFindAndModify: false });
        } else {
         updatedReference = await references.findByIdAndUpdate(_id, {
            description,
        }, { new: true, useFindAndModify: false });
    }
        if (!updatedReference) {
            return res.status(404).json({
                success: false,
                message: "Reference not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Reference updated successfully",
            reference: updatedReference,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
