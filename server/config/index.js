const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  APP_URL: process.env.APP_URL,
  ASSETS_URL: process.env.ASSETS_URL,
  port: process.env.PORT || 5000,
  MongoURL: process.env.MONGO_URL || "mongodb://127.0.0.1:27017/exam",
  SecretKey: process.env.SECRET_KEY || "starter_kit",
  TOKEN_EXPIRES_IN: process.env.TOKEN_EXPIRES_IN || 86400, // One Day
  API_URL: process.env.API_URL,
  API_SECRET_KEY: process.env.API_SECRET_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
};
