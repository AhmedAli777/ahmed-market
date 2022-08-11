/* eslint-disable  */

const stripe = require('stripe')(
  'sk_test_51LVIqUK10dA9VsHTlrKPC7EcI5Mjd1Q7Sgwx5ooyAe4bpFjr9l0QLcMUQ7EtPlnQq8gHm08WJVhjyVUsFFQtCF5C00diLUCOBN'
);
const Product = require('../models/productModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked product
  const product = await Product.findById(req.params.productId);
  //   console.log(product);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],

    success_url: `${req.protocol}://${req.get(
      'host'
    )}/my-products?alert=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/product/${product.id}`,
    customer_email: req.user.email,
    client_reference_id: req.params.productId,
    line_items: [
      {
        price_data: {
          product_data: {
            name: `${product.name} Product`,
            description: product.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/products/${
                product.imageCover
              }`,
            ],
          },
          unit_amount: product.price * 100,
          // currency: 'usd',
        },
        quantity: 1,
      },
    ],
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

const createBookingCheckout = async (session) => {
  const product = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.amount_total / 100;
  await Booking.create({ product, user, price });
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
    createBookingCheckout(event.data.object);

  res.status(200).json({ received: true });
};

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
//   const { product, user, price } = req.query;

//   if (!product && !user && !price) return next();
//   await Booking.create({ product, user, price });

//   res.redirect(req.originalUrl.split('?')[0]);
// });

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
