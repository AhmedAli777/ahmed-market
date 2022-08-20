/* eslint-disable  */

const stripe = require('stripe')(
  'sk_test_51LVIqUK10dA9VsHTlrKPC7EcI5Mjd1Q7Sgwx5ooyAe4bpFjr9l0QLcMUQ7EtPlnQq8gHm08WJVhjyVUsFFQtCF5C00diLUCOBN'
);
const Product = require('../models/productModel');
const User = require('../models/userModel');
const Payment = require('../models/paymentModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently product
  const product = await Product.findById(req.params.productId);
  //   console.log(product);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],

    success_url: `${req.protocol}://${req.get(
      'host'
    )}/my-products?alert=payment`,
    cancel_url: `${req.protocol}://${req.get('host')}/products/${product.id}`,
    customer_email: req.user.email,
    client_reference_id: req.params.productId,
    line_items: [
      {
        price_data: {
          product_data: {
            name: `${product.name}`,
            description: product.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/products/${
                product.imageCover
              }`,
            ],
          },
          unit_amount: product.price * 100,
          currency: 'usd',
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

const createPaymentCheckout = async (session) => {
  const product = session.client_reference_id;
  const vendor = (await Product.findById(session.client_reference_id)).vendor;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.amount_total / 100;
  await Payment.create({ product, vendor, user, price });
};

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed')
    createPaymentCheckout(event.data.object);

  res.status(200).json({ received: true });
};

// exports.createPaymentCheckout = catchAsync(async (req, res, next) => {
//   // This is only TEMPORARY, because it's UNSECURE: everyone can make payments without paying
//   const { product, user, price } = req.query;

//   if (!product && !user && !price) return next();
//   await Payment.create({ product, user, price });

//   res.redirect(req.originalUrl.split('?')[0]);
// });

exports.createPayment = factory.createOne(Payment);
exports.getPayment = factory.getOne(Payment);
exports.getAllPayments = factory.getAll(Payment);
exports.updatePayment = factory.updateOne(Payment);
exports.deletePayment = factory.deleteOne(Payment);
