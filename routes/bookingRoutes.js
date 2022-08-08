/* eslint-disable import/no-useless-path-segments */
/* eslint-disable import/no-dynamic-require */
const express = require('express');

const router = express.Router();

const {
  getCheckoutSession,
  getAllBookings,
  createBooking,
  getBooking,
  updateBooking,
  deleteBooking,
} = require('./../controllers/bookingController');

const { protect, restrictTo } = require('./../controllers/authController');

router.get('/checkout-session/:productId', protect, getCheckoutSession);

router.use(protect, restrictTo('admin'));

router.route('/').get(getAllBookings).post(createBooking);

router.route('/:id').get(getBooking).patch(updateBooking).delete(deleteBooking);

module.exports = router;
