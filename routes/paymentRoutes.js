/* eslint-disable import/no-useless-path-segments */
/* eslint-disable import/no-dynamic-require */
const express = require('express');

const router = express.Router();

const {
  getCheckoutSession,
  getAllPayments,
  createPayment,
  getPayment,
  updatePayment,
  deletePayment,
} = require('./../controllers/paymentController');

const { protect, restrictTo } = require('./../controllers/authController');

router.get('/checkout-session/:productId', protect, getCheckoutSession);

router.use(protect, restrictTo('admin'));

router.route('/').get(getAllPayments).post(createPayment);

router.route('/:id').get(getPayment).patch(updatePayment).delete(deletePayment);

module.exports = router;
