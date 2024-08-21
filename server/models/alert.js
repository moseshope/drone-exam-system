const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
    {
      title: String,
      content: String,
      isChecked: Boolean
    },
    { timestamps: true }
  );

module.exports = mongoose.model("Alerts", alertSchema);
