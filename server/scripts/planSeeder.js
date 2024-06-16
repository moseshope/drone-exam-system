const mongoose = require('mongoose');

const config = require('../config');
const Plan = require('../models/plan');
const { _log, _error } = require('../utils/logging');

mongoose
  .connect(config.MongoURL)
  .then(() => _log('MONGODB connected!'))
  .catch(_error);

async function run() {
  const plans = [
    {
      name: '7 Day Free Trial',
      slug: 'basic',
      stripe_plan: 'price_1P0DPFIhTKltFnGqqeb9kwup',
      price: 14.99,
      description: 'Beta Pricing: Only $14.99 / Month',
    },
    // {
    //   name: 'Personal',
    //   slug: 'Personal',
    //   stripe_plan: 'price_1NJdSqHnQ3da7QZ3Jt5TvKRi',
    //   price: 17,
    //   services: ['2 Properties', '3 Documents / Property', '1 Team Member'],
    //   description: 'For individuals with a single property to manage.',
    //   plan: {
    //     property: 2,
    //     document: 3,
    //     teamMember: 1,
    //   },
    // },
    // {
    //   name: 'Pro+',
    //   slug: 'Pro',
    //   stripe_plan: 'price_1NJdUAHnQ3da7QZ3DXGv21D4',
    //   price: 107,
    //   services: ['10 Properties', '5 Document / Property', '3 Team Members'],
    //   description: 'For landlords & family offices with multiple properties.',
    //   plan: {
    //     property: 7,
    //     document: 5,
    //     teamMember: 3,
    //   },
    // },
    // {
    //   name: 'Commercial',
    //   slug: 'Commercial',
    //   stripe_plan: 'price_1NJdUgHnQ3da7QZ35w3s2dT4',
    //   price: 507,
    //   services: ['25 Properties', '10 Documents / Property', '7 Team Members'],
    //   description: 'For commercial real estate management companies.',
    //   plan: {
    //     property: 25,
    //     document: 10,
    //     teamMember: 7,
    //   },
    // },
  ];

  await Plan.deleteMany({});

  for (const plan of plans) {
    await new Plan(plan).save();
  }

  _log('Plan seeder successfully.');
  mongoose.disconnect();
}

run();
