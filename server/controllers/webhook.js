const Stripe = require('stripe');

const config = require('../config');
const Subscription = require('../models/subscription');
const User = require('../models/userModel');
const PlanModel = require('../models/plan');
const { _log, _error } = require('../utils/logging');
const { getSocketIO } = require('../socket');

const stripe = new Stripe(config.STRIPE_SECRET_KEY);

exports.index = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, config.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    _error("Stripe webhook signature verification failed", err.message);
    res.status(400).end();
    return;
  }

  _log(event.type);

  if (event.type === 'customer.subscription.updated') {
    // _log(event.type, event.data.object);

    const subscription = event.data.object;
    let sub = await Subscription.findOne({ stripeId: subscription.id });
    sub.ends_at = subscription.cancel_at_period_end ? subscription.cancel_at * 1000 : null;
    sub.status = subscription.status;
    if (subscription.trial_start && subscription.status === 'active') {
      let plan = await PlanModel.findOne({ slug: 'basic' });
      sub.planId = plan._id;
      sub.trial_ends_at = null;
      sub.next_payment_at = subscription.current_period_end * 1000;
    }
    await sub.save();
    getSocketIO().to(sub.userId.toString()).emit('SUBSCRIPTION_EVENT', { success: true });

  } else if (event.type === 'invoice.payment_succeeded') {

    const subscription = await stripe.subscriptions.retrieve(event.data.object.subscription);
    await Subscription.findOneAndUpdate({
      stripeId: subscription.id
    }, {
      next_payment_at: subscription.current_period_end * 1000
    });

  } else if (event.type == 'customer.subscription.deleted') {

    const sub = await Subscription.findOne({ stripeId: event.data.object.id });
    if (sub) {

      const user = await User.findOne({ activeSubscriptionId: sub._id });

      if (user) {
        user.activeSubscriptionId = user.selectedSubscriptionId;
        // const sub = await Subscription.findById(user.selectedSubscriptionId).populate('planId');
        user.selectedSubscriptionId = null;
        await user.save();
      }

      await sub.delete();
    }
    getSocketIO().to(sub.userId.toString()).emit('SUBSCRIPTION_EVENT', { success: true });

  } else if (event.type === 'invoice.payment_failed') {

    const invoice = event.data.object;
    const subscriptionId = invoice.subscription;
    let sub = await Subscription.findOne({ stripeId: subscriptionId });
    sub.hosted_invoice = invoice.hosted_invoice_url;
    await sub.save();
    getSocketIO().to(sub.userId.toString()).emit('SUBSCRIPTION_EVENT', { success: true });

  } else if (event.type === 'customer.subscription.trial_will_end') {
    const subscription = event.data.object;
    // _log(subscription, subscription.metadata.admin, 'will end');
    // Cancel the subscription
    if (subscription.metadata.admin === 'true') {
      await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true,
      });
    }
  } else if (event.type === 'charge.succeeded') {
    let data = event.data.object;
    let { userId, planId } = data.metadata;
    if (userId && planId) {
      let user = await User.findById(userId);
      let plan = await PlanModel.findById(planId);
      // One time purchase logic
      getSocketIO().to(user._id.toString()).emit('charge.succeeded', {
        success: true,
      });
    }
  }
  
  return res.send('ok');
}