const mongoose = require("mongoose");
const { Schema } = mongoose;

const referencesSchema = new mongoose.Schema(
  {
    fileName: String,
    dir: String,
    description: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("references", referencesSchema);
