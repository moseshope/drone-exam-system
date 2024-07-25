const ProblemsModel = require("../models/problems");

exports.getProblems = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit);
    const categories = await ProblemsModel.distinct("category"); // Get all unique categories

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No categories found.",
      });
    }

    const problemsByCategory = await Promise.all(
      categories.map(async (category, index) => {
        let tempLimit = 0;
        if (limit == 60) {
          if (index == 0) {
            tempLimit = 10;
          } else if (index == 1) {
            tempLimit = 10;
          } else if (index == 2) {
            tempLimit = 10;
          } else if (index == 3) {
            tempLimit = 5;
          } else if (index == 4) {
            tempLimit = 25;
          }
        } else {
          if (index != 4) {
            tempLimit = Math.floor(limit / 5);
          } else if (index == 4) {
            tempLimit = limit - Math.floor(limit / 5) * 4;
          }
        }
        // Use aggregation to get limit random documents per category
        const randomProblems = await ProblemsModel.aggregate([
          { $match: { category: category } }, // Filter by category
          { $sample: { size: tempLimit } }, // Randomly select limit documents
        ]);

        return {
          category: category,
          problems: randomProblems,
        };
      })
    );

    return res.json({
      success: true,
      data: problemsByCategory, // Directly return the array of category objects
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.addProblem = async (req, res) => {
  try {
    let data = req.body.data;
    data["avail_answers"] = [];
    data["avail_answers"][0] = data.avail_answer_1;
    data["avail_answers"][1] = data.avail_answer_2;
    data["avail_answers"][2] = data.avail_answer_3;
    delete data.avail_answer_1;
    delete data.avail_answer_2;
    delete data.avail_answer_3;

    const newProblem = await ProblemsModel.create(data);
    return res.status(200).json({
      success: true,
      message: "Success",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllProblems = async (req, res) => {
  let {
    page,
    limit,
    category,
    prob_no,
    prob_content,
    avail_answers,
    cor_answer,
    cor_description,
  } = req.query;
  page = page ?? 1;
  limit = limit ?? 10;
  category = category ?? "";
  prob_no = prob_no ?? "";
  prob_content = prob_content ?? "";
  avail_answers = avail_answers ?? "";
  cor_answer = cor_answer ?? "";
  cor_description = cor_description ?? "";
  let where = {};
  if (category) {
    where.category = new RegExp(category, "i");
  }
  if (prob_no) {
    where.prob_no = Number(prob_no);
  }
  if (prob_content) {
    where.prob_content = new RegExp(prob_content, "i");
  }
  if (avail_answers) {
    where.avail_answers = new RegExp(avail_answers, "i");
  }
  if (cor_answer) {
    where.cor_answer = new RegExp(cor_answer, "i");
  }
  if (cor_description) {
    where.cor_description = new RegExp(cor_description, "i");
  }
  const skip = (page - 1) * limit;
  const total = await ProblemsModel.count(where);
  const problems = await ProblemsModel.find(where)
    .select({ password: 0 })
    .sort({ category: 1 })
    .skip(skip)
    .limit(limit);
  return res.json({
    success: true,
    problems,
    total,
  });
};

exports.updateProblem = async (req, res) => {
  try {
    let problem = req.body.data;
    problem.avail_answers = new Array(3);
    problem["avail_answers"][0] = problem.avail_answer_1;
    problem["avail_answers"][1] = problem.avail_answer_2;
    problem["avail_answers"][2] = problem.avail_answer_3;
    delete problem.avail_answer_1;
    delete problem.avail_answer_2;
    delete problem.avail_answer_3;

    let { _id, ...rest } = problem;
    const result = await ProblemsModel.findOneAndUpdate(
      {_id: problem._id},
      { $set: { ...rest } }, // Spread the fields of `problem` directly
      {
        new: true,
      }
    );

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to update problem",
    });
  }
};

exports.deleteProblem = async (req, res) => {
  try {
    const _id = req.query._id; // Assuming the _id is passed as a URL parameter

    const result = await ProblemsModel.findByIdAndDelete(_id, {
      useFindAndModify: false, // Add this option to avoid deprecation warning
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    return res.json({
      success: true,
      message: "Problem successfully deleted",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete problem",
    });
  }
};

exports.getProblemCount = async (req, res) => {
  try {
    const totalCount = await ProblemsModel.count();
    return res.status(200).json({
      success: true,
      count: totalCount,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to get total count of problem",
    });
  }
};
