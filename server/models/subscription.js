const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SubscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: 'plans',
    },
    name: {
      type: String,
      required: true,
    },
    stripeId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      default: 'active',
    },
    stripe_price: {
      type: String,
    },
    trial_ends_at: {
      type: Date,
    },
    ends_at: {
      type: Date,
    },
    next_payment_at: {
      type: Date,
    },
    hosted_invoice: {
      type: String,
    }
  },
  {
    timestamps: true,
  },
);

const SubscriptionModel = mongoose.model('subscriptions', SubscriptionSchema);

module.exports = SubscriptionModel;
