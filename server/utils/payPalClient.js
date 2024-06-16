
const paypal = require('@paypal/checkout-server-sdk');
const config = require('../config');

function environment() {
  let clientId = config.PAYPAL_CLIENT_ID;
  let clientSecret = config.PAYPAL_CLIENT_SECRET;

  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
  // return new paypal.core.LiveEnvironment(clientId, clientSecret);
}

function client() {
  return new paypal.core.PayPalHttpClient(environment());
}

module.exports = { client };
