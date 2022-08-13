/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-unused-vars */
const Product = require(`${__dirname}/../models/productModel`);
const User = require(`${__dirname}/../models/userModel`);
const Payment = require(`${__dirname}/../models/paymentModel`);

const catchAsync = require(`${__dirname}/../utils/catchAsync`);
// const factory = require(`${__dirname}/handlerFactory`);
const AppError = require(`${__dirname}/../utils/appError`);

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'payment')
    res.locals.alert =
      "Your payment was successful! Please check your email for a confirmation. If your payment doesn't show up here immediatly, please come back later.";
  next();
};

exports.getOverview = catchAsync(async (req, res, next) => {
  //1)Get data from collection
  const products = await Product.find({ status: 'approved' });
  //2) render
  res.status(200).render('overview', {
    title: 'All Products',
    products,
  });
});

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate({
      path: 'reviews',
      fields: 'review rating user',
    })
    .populate('vendor');
  // console.log(product.images);
  if (!product) {
    return next(new AppError('There is no product with that name.', 404));
  }
  res.status(200).render('product', {
    title: `${product.name}`,
    product,
  });
});

exports.getMyProducts = catchAsync(async (req, res, next) => {
  // 1) Find all payments
  const payments = await Payment.find({ user: req.user.id });
  // 2) Find products with the returned IDs
  const productIDs = payments.map((el) => el.product);
  const products = await Product.find({ _id: { $in: productIDs } });

  res.status(200).render('overview', {
    title: 'My Products',
    products,
  });
});

///////////////////////////////////////
/////////ADMIN VIEWS//////////////////
exports.getWaitingProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find({ status: 'waiting' });

  res.status(200).render('overview', {
    title: 'Waiting Products',
    products,
  });
});

exports.getRejectedProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find({ status: 'rejected' });

  res.status(200).render('overview', {
    title: 'Rejected Products',
    products,
  });
});

///////////////////////////////////////
/////////VENDOR VIEWS//////////////////

exports.getMyPaidProducts = catchAsync(async (req, res, next) => {
  // 1) Find all payments
  const payments = await Payment.find({ vendor: req.user.id });
  // 2) Find products with the returned IDs
  const productIDs = payments.map((el) => el.product);
  const products = await Product.find({ _id: { $in: productIDs } });

  res.status(200).render('overview', {
    title: 'Paid Products',
    products,
  });
});

exports.getMyApprovedProducts = catchAsync(async (req, res, next) => {
  // 1) Find all payments

  const products = await Product.find({
    vendor: req.user.id,
    status: 'approved',
  });

  res.status(200).render('overview', {
    title: 'Approved Products',
    products,
  });
});

exports.getMyRejectedProducts = catchAsync(async (req, res, next) => {
  // 1) Find all payments

  const products = await Product.find({
    vendor: req.user.id,
    status: 'rejected',
  });

  res.status(200).render('overview', {
    title: 'Rejected Products',
    products,
  });
});
//////////////////////////////////////////////////

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account ',
  });
};

exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Sign up ! ',
  });
};
exports.getnewproductForm = (req, res) => {
  res.status(200).render('newProduct', {
    title: 'Add new product ',
  });
};
exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});
