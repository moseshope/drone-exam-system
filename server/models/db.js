const mongoose = require("mongoose");
const { Schema } = mongoose;

const dbSchema = new mongoose.Schema(
  {
    fileName: String,
    dir: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("db", dbSchema);
