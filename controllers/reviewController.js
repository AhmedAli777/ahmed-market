/* eslint-disable import/no-dynamic-require */
const Review = require(`${__dirname}/../models/reviewModel`);
const factory = require(`${__dirname}/handlerFactory`);

// const catchAsync = require(`${__dirname}/../utils/catchAsync`);

exports.setProductUserIds = (req, res, next) => {
  //allow nested routes
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
