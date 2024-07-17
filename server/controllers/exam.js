const ExamModel = require("../models/exam.js");
const UserModel = require("../models/userModel.js");

exports.saveExam = async (req, res) => {
  try {
    console.log(req.body);
    const newExam = new ExamModel({
      user: req.user._id,
      score1: req.body.score[0],
      score2: req.body.score[1],
      score3: req.body.score[2],
      score4: req.body.score[3],
      score5: req.body.score[4],
      score: req.body.score[5],
      problems: req.body.problems
    });

    await newExam.save();

    return res.status(200).json({
      success: true,
      message: "Success",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getAllExam = async (req, res) => {
  let { page, limit, name, email, minScore, maxScore } = req.query;
  console.log(req.query);
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  name = name ?? "";
  email = email ?? "";

  // Construct the filter object for the user
  let userFilter = {};
  if (name) {
    userFilter.name = new RegExp(name, "i");
  }
  if (email) {
    userFilter.email = new RegExp(email, "i");
  }

  try {
    // Find users matching the filter criteria
    const users = await UserModel.find(userFilter).select("_id");

    // Get the user IDs from the matching users
    const userIds = users.map((user) => user._id);

    // Construct the filter object for the exams
    let examFilter = {};
    if (userIds.length > 0) {
      examFilter.user = { $in: userIds };
    }

    isNaN(minScore) || minScore == "" ? (minScore = 0) : (minScore = minScore);
    isNaN(maxScore) || maxScore == ""
      ? (maxScore = 100)
      : (maxScore = maxScore);

    examFilter.score = {};
    examFilter.score.$gte = minScore;
    examFilter.score.$lte = maxScore;

    if ((name || email) && userIds.length == 0) {
      return res.json({
        success: true,
        exams: [],
        total: 0,
      });
    }

    const skip = (page - 1) * limit;
    const total = await ExamModel.countDocuments(examFilter);
    const exams = await ExamModel.find(examFilter)
    .sort({ createdAt: -1 })
      .populate("user", "-password") // Populate user information, excluding password
      .skip(skip)
      .limit(limit);

    return res.json({
      success: true,
      exams,
      total,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getLastExam = async (req, res) => {
  let { page, limit, name, email } = req.query;
  console.log(req.query);
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  name = name ?? "";
  email = email ?? "";

  // Construct the filter object for the user
  let userFilter = {};
  if (name) {
    userFilter.name = new RegExp(name, "i");
  }
  if (email) {
    userFilter.email = new RegExp(email, "i");
  }

  try {
    // Find users matching the filter criteria
    const users = await UserModel.find(userFilter).select("_id name email");

    // Get the user IDs from the matching users
    const userIds = users.map((user) => user._id);

    // Fetch the latest 5 exams for each user
    const userExamPromises = userIds.map(async (userId) => {
      const exams = await ExamModel.find({ user: userId })
        .sort({ createdAt: -1 }) // Sort by creation date in descending order
        .limit(5) // Limit to the latest 5 exams
        .select("score score1 score2 score3 score4 score5 createdAt"); // Select necessary fields
      return { userId, exams };
    });

    const examsGroupedByUser = await Promise.all(userExamPromises);
    // Format the data to the required structure
    const formattedData = examsGroupedByUser.map(({ userId, exams }) => {
      const user = users.find((u) => u._id.equals(userId));
      return {
        _id: user._id,
        user: {
          name: user.name,
          email: user.email,
        },
        score: exams.map((exam) => exam.score),
        score1: exams.map((exam) => exam.score1),
        score2: exams.map((exam) => exam.score2),
        score3: exams.map((exam) => exam.score3),
        score4: exams.map((exam) => exam.score4),
        score5: exams.map((exam) => exam.score5),
      };
    });

    // Apply pagination
    const skip = (page - 1) * limit;
    const paginatedExams = formattedData.slice(skip, skip + limit);
    const total = formattedData.length;

    return res.json({
      success: true,
      exams: paginatedExams,
      total,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getExamProblems = async (req, res) => {
  const {_id} = req.query;
  console.log(_id);
  try {
    const examData = await ExamModel.findById(_id);
    return res.json({
      success: true,
      exam: examData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
