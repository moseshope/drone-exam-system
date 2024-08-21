const mongoose = require("mongoose");
const { Schema } = mongoose;

const alertSchema = new mongoose.Schema(
    {
      title: String,
      content: String,
      user: {
        type: Schema.Types.ObjectId,
        ref: "users",
      }, 
      isChecked: Boolean
    },
    { timestamps: true }
  );

module.exports = mongoose.model("Alerts", alertSchema);
