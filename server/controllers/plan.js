
const Stripe = require('stripe');
const paypal = require('@paypal/checkout-server-sdk');

const Plan = require('../models/plan');
const User = require('../models/userModel');
const Subscription = require('../models/subscription');

const config = require('../config');
const { _error } = require('../utils/logging');
const { client } = require('../utils/payPalClient');

const stripe = new Stripe(config.STRIPE_SECRET_KEY);

exports.getAll = async (req, res) => {
  try {
    const plans = await Plan.find();
    return res.json({
      success: true,
      plans,
    });
  } catch (error) {
    _error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createSetupIntent = async (req, res) => {
  try {
    let customerId = req.user.stripeId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
      });
      customerId = customer.id;
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      usage: 'off_session', // Indicate that the payment method will be used later
    });

    return res.json({ clientSecret: setupIntent.client_secret, customerId });
  } catch (error) {
    return res.status(400).json({ error: { message: error.message } });
  }
};

exports.createSubscription = async (req, res) => {
  try {
    // create a stripe customer
    const { paymentMethod, planId, pm_type, pm_last_four, customerId } = req.body;
    const plan = await Plan.findById(planId);
    const priceId = plan.stripe_plan;
    // let customerId = req.user.stripeId;
    let trial = {};
    if (!req.user.pm_last_four) {
      trial = { trial_period_days: 7 };
    }
    if (!customerId) {
      let customer = await stripe.customers.create({
        name: req.user.name,
        email: req.user.email,
        payment_method: paymentMethod,
        invoice_settings: {
          default_payment_method: paymentMethod,
        },
      });
      customerId = customer.id;
      req.user.stripeId = customerId;
      req.user.pm_type = pm_type;
      req.user.pm_last_four = pm_last_four;
      await req.user.save();
    } else if (paymentMethod && customerId) {
      // if (req.user.pm_last_four) {
      //   await stripe.customers.update(customerId, {
      //     payment_method: paymentMethod,
      //     invoice_settings: {
      //       default_payment_method: paymentMethod,
      //     },
      //   });
      // } else {
      await stripe.paymentMethods.attach(paymentMethod, {
        customer: customerId,
      });

      // Set the new payment method as the customer's default
      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethod },
      });
      // }

      req.user.pm_type = pm_type;
      req.user.pm_last_four = pm_last_four;
      req.user.stripeId = customerId;
      await req.user.save();
    }

    // get the user subscription.
    const actSub = await Subscription.findById(
      req.user.activeSubscriptionId,
    ).populate('planId');
    const selSub = await Subscription.findById(
      req.user.selectedSubscriptionId,
    ).populate('planId');
    let subscription;

    /* if (actSub && selSub) {
      if (actSub.planId.price < plan.price) {
        req.user.activeSubscriptionId = null;
        req.user.selectedSubscriptionId = null;
        await req.user.save();
        await stripe.subscriptions.cancel(actSub.stripeId);
        await stripe.subscriptions.cancel(selSub.stripeId);
        // new Save act and remove sel
        // create a stripe subscription
        subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: priceId }],
          payment_settings: {
            payment_method_options: {
              card: {
                request_three_d_secure: 'any',
              },
            },
            payment_method_types: ['card'],
            save_default_payment_method: 'on_subscription',
          },
          expand: ['latest_invoice.payment_intent'],
          metadata: {
            userId: req.user._id,
          },
        });

        // return the client secret and subscription id
        const sub = await new Subscription({
          userId: req.user._id,
          planId: planId,
          name: 'landlord_monthly_subscription',
          stripeId: subscription.id,
          stripe_price: priceId,
        }).save();
        req.user.activeSubscriptionId = sub._id;
        req.user.plan = plan.plan;
        await req.user.save();
      } else if (actSub.planId.price > plan.price) {
        if (selSub.planId._id != plan._id) {
          req.user.selectedSubscriptionId = null;
          await req.user.save();
          await stripe.subscriptions.cancel(selSub.stripeId);
          //new update sel
          // create a stripe subscription
          const subs = await stripe.subscriptions.retrieve(actSub.stripeId);
          subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_settings: {
              payment_method_options: {
                card: {
                  request_three_d_secure: 'any',
                },
              },
              payment_method_types: ['card'],
              save_default_payment_method: 'on_subscription',
            },
            expand: ['latest_invoice.payment_intent'],
            metadata: {
              userId: req.user._id,
            },
            trial_end: subs.current_period_end,
          });

          // return the client secret and subscription id
          const sub = await new Subscription({
            userId: req.user._id,
            planId: planId,
            name: 'landlord_monthly_subscription',
            stripeId: subscription.id,
            stripe_price: priceId,
          }).save();
          req.user.selectedSubscriptionId = sub._id;
          await req.user.save();
        }
      } else {
        // req.user.activeSubscriptionId = req.user.selectedSubscriptionId;
        // req.user.selectedSubscriptionId = null;
        // await req.user.save();
        await stripe.subscriptions.cancel(selSub.stripeId);
        await stripe.subscriptions.update(actSub.stripeId, {
          cancel_at_period_end: true,
        });
      }
    } else if (actSub && !selSub) {
      if (actSub.planId.price < plan.price) {
        req.user.activeSubscriptionId = null;
        await req.user.save();
        await stripe.subscriptions.cancel(actSub.stripeId);
        //new save act
        // create a stripe subscription
        subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: priceId }],
          payment_settings: {
            payment_method_options: {
              card: {
                request_three_d_secure: 'any',
              },
            },
            payment_method_types: ['card'],
            save_default_payment_method: 'on_subscription',
          },
          expand: ['latest_invoice.payment_intent'],
          metadata: {
            userId: req.user._id,
          },
        });

        // return the client secret and subscription id
        const sub = await new Subscription({
          userId: req.user._id,
          planId: planId,
          name: 'landlord_monthly_subscription',
          stripeId: subscription.id,
          stripe_price: priceId,
        }).save();
        req.user.activeSubscriptionId = sub._id;
        req.user.plan = plan.plan;
        await req.user.save();
      } else if (actSub.planId.price > plan.price) {
        await stripe.subscriptions.update(actSub.stripeId, {
          cancel_at_period_end: true,
        });
        const subs = await stripe.subscriptions.retrieve(actSub.stripeId);
        // new save sel
        // create a stripe subscription
        subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: priceId }],
          payment_settings: {
            payment_method_options: {
              card: {
                request_three_d_secure: 'any',
              },
            },
            payment_method_types: ['card'],
            save_default_payment_method: 'on_subscription',
          },
          expand: ['latest_invoice.payment_intent'],
          metadata: {
            userId: req.user._id,
          },
          trial_end: subs.current_period_end,
        });

        // return the client secret and subscription id
        const sub = await new Subscription({
          userId: req.user._id,
          planId: planId,
          name: 'landlord_monthly_subscription',
          stripeId: subscription.id,
          stripe_price: priceId,
        }).save();
        req.user.selectedSubscriptionId = sub._id;
        await req.user.save();
      }
    } else  */if (!actSub) {
      //new save act
      // create a stripe subscription
      subscription = await stripe.subscriptions.create({
        customer: customerId,
        ...trial,
        items: [{ price: priceId }],
        payment_settings: {
          payment_method_options: {
            card: {
              request_three_d_secure: 'any',
            },
          },
          payment_method_types: ['card'],
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId: req.user._id.toString(),
        },
      });

      // return the client secret and subscription id
      const sub = await new Subscription({
        userId: req.user._id,
        planId: planId,
        name: 'concept_monthly_subscription',
        stripeId: subscription.id,
        stripe_price: priceId,
      }).save();
      req.user.activeSubscriptionId = sub._id;
      // req.user.plan = plan.plan;
      await req.user.save();
    } else {
      return res.status(400).json({
        success: false,
        message: "You have already subscribed."
      });
    }
    // console.log(subscription);
    return res.json({
      success: true,
      clientSecret: subscription?.latest_invoice?.payment_intent?.client_secret,
    });
  } catch (error) {
    _error(error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const actSub = await Subscription.findById(
      req.user.activeSubscriptionId,
    ).populate('planId');
    const selSub = await Subscription.findById(
      req.user.selectedSubscriptionId,
    ).populate('planId');
    if (selSub) {
      req.user.selectedSubscriptionId = null;
      await req.user.save();
      await stripe.subscriptions.cancel(selSub.stripeId);
    }

    if (actSub) {
      if (actSub.planId.price === 0) {
        await stripe.subscriptions.del(actSub.stripeId);
      } else {
        await stripe.subscriptions.update(actSub.stripeId, {
          cancel_at_period_end: true,
        });
      }

      // if (req.user.utm_content) {
      //   await User.findByIdAndUpdate(req.user.utm_content, {
      //     $inc: {
      //       cancelled: 1,
      //     },
      //   });
      // }
    }
    return res.json({
      success: true,
      message: 'Successfully cancelled!',
    });
  } catch (error) {
    _error(error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.continueSubscription = async (req, res) => {
  try {
    const actSub = await Subscription.findById(
      req.user.activeSubscriptionId,
    ).populate('planId');
    if (actSub && actSub.ends_at) {
      await stripe.subscriptions.update(actSub.stripeId, {
        cancel_at_period_end: false,
      });
    }
    return res.json({
      success: true,
      message: 'Successful!',
    });
  } catch (error) {
    _error(error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

exports.createFreeSubscriptionByAdmin = async (req, res) => { };

exports.getUserSubscription = async (req, res) => {
  try {
    const activeSubscription = await Subscription.findById(
      req.user.activeSubscriptionId,
    ).populate('planId');
    const selectedSubscription = await Subscription.findById(
      req.user.selectedSubscriptionId,
    ).populate('planId');
    // console.log()
    return res.json({
      success: true,
      activeSubscription,
      selectedSubscription,
    });
  } catch (error) {
    _error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getActivePlan = async (req, res) => {
  try {
    // const activeSubscription = await Subscription.findById(
    //   req.user.activeSubscriptionId,
    // ).populate('planId');

    return res.json({
      success: true,
      // plan: req.user.plan,
    });
  } catch (error) {
    _error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// exports.orderWithPayPal = async (req, res) => {
//   try {
//     const { orderData } = req.body;
//     // const orderId = req.params.orderId;
//     const { name, email, orderId, ...rest } = orderData;
//     const paypalClient = client();
//     const orderItem = await OrderModel.findById(orderId);
//     if (!orderItem) {
//       return res.status(400).json({
//         success: false,
//         message: "Order not found!"
//       });
//     }

//     const request = new paypal.orders.OrdersCreateRequest();
//     request.prefer("return=representation");
//     request.requestBody({
//       intent: "CAPTURE",
//       purchase_units: [{
//         amount: {
//           currency_code: 'USD',
//           value: totalPrice(orderItem),
//         }
//       }]
//     });

//     const order = await paypalClient.execute(request);
//     await OrderModel.findByIdAndUpdate(orderId, {
//       $set: {
//         ...rest,
//         payPalId: order.result.id,
//       },
//     }, { new: true });

//     // orderItem.payPalId = order.result.id;
//     // await orderItem.save();
//     return res.json({
//       success: true,
//       result: order.result,
//     });
//   } catch (error) {
//     _error('plan:orderWithPayPal', error);
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong!"
//     });
//   }
// }

// exports.getOrderStatus = async (req, res) => {
//   try {
//     const orderId = req.params.orderId;
//     const orderData = await OrderModel.findById(orderId).populate('userId');
//     if (!orderData || !orderData.payPalId) {
//       return res.status(400).json({
//         success: false,
//         message: "Order not found!",
//       });
//     }
//     const paypalClient = client();
//     const request = new paypal.orders.OrdersCaptureRequest(orderData.payPalId);
//     request.requestBody({});

//     const capture = await paypalClient.execute(request);

//     if (capture.result.status == "COMPLETED") {

//       orderData.paymentId = capture.result.id;
//       orderData.paidDate = Date.now();
//       if (orderData.status == 3) {
//         orderData.status = 4;
//       }
//       // await orderData.save();
//       if (orderData.status !== 4) {
//         sendEmail({
//           from: process.env.FROM_ADDRESS,
//           to: [process.env.SUPPORT_ADDRESS, "mikelian0603@gmail.com"], /* "sniper.dev716@gmail.com", */
//           subject: `Restore image requested! [${orderData.userId.email}]`,
//           html: 'restore_photo',
//           data: {
//             name: orderData.userId.name,
//             email: orderData.userId.email,
//             order: orderData,
//             total: totalPrice(orderData)
//           },
//         });
//       }
//       orderData.paid = totalPrice(orderData);
//       orderData.userId.spent += totalPrice(orderData);
//       await orderData.userId.save();
//       await orderData.save();
//       // getSocketIO().to(orderData.userId._id.toString()).emit('charge.succeeded', {
//       //   success: true,
//       //   type: 'paypal',
//       //   orderId: orderData.status == 4 ? orderData._id : null,
//       // });
//     }

//     return res.json({
//       success: true,
//       result: capture.result,
//       orderId: orderData.status == 4 ? orderData._id : null,
//     });
//   } catch (error) {
//     _error("plan:getOrderStatus", error);
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong!",
//     });
//   }
// }