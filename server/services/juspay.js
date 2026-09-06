const { Juspay } = require('expresscheckout-nodejs');

let juspayInstance = null;

try {
  if (process.env.JUSPAY_MERCHANT_ID && process.env.JUSPAY_API_KEY) {
    juspayInstance = new Juspay({
      merchantId: process.env.JUSPAY_MERCHANT_ID,
      apiKey: process.env.JUSPAY_API_KEY,
      baseUrl: process.env.JUSPAY_BASE_URL || 'https://sandbox.juspay.in',
    });
  }
} catch (err) {
  console.warn('Juspay initialization warning (will use fallback sandbox simulator):', err.message);
}

module.exports = juspayInstance;
