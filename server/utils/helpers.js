
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const sendgrid = require('@sendgrid/mail');
const ejs = require('ejs');

const { _log, _error } = require('./logging');
const config = require('../config');
const User = require('../models/userModel');
const { getSocketIO } = require('../socket');

exports.sleep = (time) =>
  new Promise((resolve) => setTimeout(resolve, time * 1000));

exports.delFile = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(path.resolve(filePath));
      _log(`'${filePath}' has been removed successfully!`);
    } else {
      _log(`'${filePath}' does not exist!`);
    }
  } catch (error) {
    _error(error);
  }
};

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendEmail = async ({ to, from, subject, text, html, data, reply_to }) => {
  let emailTemplate = await ejs.renderFile(path.join(__dirname, `../views/${html}.ejs`), data);
  const msg = { to, from, subject, text, html: emailTemplate, reply_to };
  return sendgrid.send(msg);
};

const secretKey = config.SecretKey; // Keep this key secure

exports.generateToken = (userId) => {
  const expiresIn = '1h'; // Token expires in one hour
  const payload = {
    id: userId, // Embed user ID or any other data you need
    time: new Date()
  };

  const token = jwt.sign(payload, secretKey, { expiresIn });
  return token;
}

exports.verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded;
  } catch (error) {
    // handle token verification errors, e.g., token expired, invalid token
    _error("helper:verifyToken", error.message);
    return null;
  }
}

exports.sendNotification = async (msg) => {
  try {
    let admins = await User.find({ permission: 1 }, '_id');
    let ids = admins.map(ad => ad._id.toString());
    getSocketIO().to(ids).emit('NOTIFICATION_EVENT', { success: true, message: msg });
  } catch (error) {
    _error("helper:sendNotification", error);
  }
}