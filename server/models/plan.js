const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PlanSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    stripe_plan: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const PlanModel = mongoose.model('plans', PlanSchema);

module.exports = PlanModel;
