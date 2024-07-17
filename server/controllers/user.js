const SubscriptionModel = require("../models/subscription");
const User = require("../models/userModel");
const ExamModel = require("../models/exam");
const { delFile } = require("../utils/helpers");
const { _log, _error } = require("../utils/logging");

exports.getUser = async (req, res) => {
  try {
    const user = {
      _id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      avatar: req.user.avatar,
      stripeId: req.user.stripeId,
      isAdmin: req.user.permission == 1,
      pm_last_four: req.user.pm_last_four,
    };
    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    _log(error);
    return res.status(500).json({
      success: false,
      error,
    });
  }
};

exports.getUsers = async (req, res) => {
  let { page, limit, name, email, utm_source, utm_campaign } = req.query;
  page = page ?? 1;
  limit = limit ?? 10;
  name = name ?? "";
  email = email ?? "";
  utm_source = utm_source ?? "";
  utm_campaign = utm_campaign ?? "";
  let where = {};
  if (name) {
    where.name = new RegExp(name, "i");
  }
  if (email) {
    where.email = new RegExp(email, "i");
  }
  if (utm_source) {
    where.utm_source = new RegExp(utm_source, "i");
  }
  if (utm_campaign) {
    where.utm_campaign = new RegExp(utm_campaign, "i");
  }
  const skip = (page - 1) * limit;
  const total = await User.count(where);
  const users = await User.find(where)
    .select({ password: 0 })
    .populate({
      path: "activeSubscriptionId",
      populate: "planId",
    })
    .skip(skip)
    .limit(limit);
  return res.json({
    success: true,
    users,
    total,
  });
};

exports.upload = async (req, res) => {
  try {
    const file = req.file;
    const oldFile = req.body.oldFile;

    if (oldFile) {
      delFile(`public${oldFile}`);
    }

    req.user.avatar = file.path.replace(/\\/g, "/").replace("public/", "/");

    await req.user.save();

    return res.json({
      success: true,
      path: file.path.replace(/\\/g, "/").replace("public/", "/"),
      filename: file.originalname,
    });
  } catch (error) {
    _error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;

  const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Create a case-insensitive regular expression with the escaped email
  const emailRegex = new RegExp(`^${escapedEmail}$`, "i");

  const existUser = await User.findOne({
    email: emailRegex,
    _id: { $ne: req.user._id },
  });
  if (existUser) {
    return res.status(422).json({
      success: false,
      errors: {
        email: "This email has already been taken.",
      },
    });
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      name,
      email,
    },
    {
      new: true,
    }
  );
  return res.json({
    success: true,
    user,
  });
};

exports.updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const isValid = await req.user.isValidPassword(oldPassword);
  if (!isValid) {
    return res.status(401).json({
      success: false,
      errors: {
        oldPassword: "This password is invalid.",
      },
    });
  }
  req.user.password = newPassword;
  await req.user.save();
  return res.json({
    success: true,
  });
};

exports.deleteAccount = async (req, res) => {
  const { password } = req.body;
  const isValid = await req.user.isValidPassword(password);
  if (!isValid) {
    return res.status(401).json({
      success: false,
      errors: {
        password: "This password is invalid.",
      },
    });
  }
  req.user.status = 2;
  await req.user.save();
  return res.json({
    success: true,
  });
};

exports.getUserCount = async (req, res) => {
  try {
    const totalCount = await User.count();
    return res.status(200).json({
      success: true,
      count: totalCount,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to get total count of user",
    });
  }
};

exports.getUserStatus = async (req, res) => {
  try {
    const existUser = await User.findOne({
      _id: req.user._id
    });
    return res.status(200).json({
      success: true,
      data: existUser,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to get info of user",
    });
  }
};

exports.checkLastStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    let count = 0;
    const exams = await ExamModel.find({ user: userId })
        .sort({ createdAt: -1 }) // Sort by creation date in descending order
        .limit(5) // Limit to the latest 5 exams
        .select("score"); // Select necessary fields
    exams.map((exam) => {
      if(exam.score >= 90) {
        count ++;
      }
    });

    return res.status(200).json({
      success: true,
      status: count >= 4 ? true : false,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to get info of user",
    });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const _id = req.user._id;

    // Ensure the status is updated properly
    const status = await User.findByIdAndUpdate(
      _id, 
      { certStatus: 1 },
      { new: true }  // To return the updated document
    );

    if (!status) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      status: status.status,
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { _id, status } = req.body;
    // Ensure the status is updated properly
    const response = await User.findByIdAndUpdate(
      _id, 
      { status: status == true ? 1 : 0 },
      { new: true }  // To return the updated document
    );

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      status: status,
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};