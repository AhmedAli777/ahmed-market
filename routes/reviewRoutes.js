/* eslint-disable import/no-dynamic-require */

const {
  getAllReviews,
  createReview,
  deleteReview,
  setTourUserIds,
  updateReview,
  getReview,
} = require(`${__dirname}/../controllers/reviewController`);

const {
  protect,
  restrictTo,
} = require(`${__dirname}/../controllers/authController`);
const express = require('express');

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), setTourUserIds, createReview);

router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('admin', 'user'), updateReview)
  .delete(restrictTo('admin', 'user'), deleteReview);
module.exports = router;
