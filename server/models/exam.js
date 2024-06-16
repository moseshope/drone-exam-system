const mongoose = require("mongoose");
const UsersModel = require("../models/userModel");
const { Schema } = mongoose;

const ExamSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    score: Number,
    score1: Number,
    score2: Number,
    score3: Number,
    score4: Number,
    score5: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exam", ExamSchema);
