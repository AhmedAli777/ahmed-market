/* eslint-disable import/no-dynamic-require */
const express = require('express');

const router = express.Router();

const {
  getOverview,
  getProduct,
  getLoginForm,
  getAccount,
  updateUserData,
  getSignupForm,
  getMyProducts,
  alerts,
} = require(`${__dirname}/../controllers/viewController`);
const {
  isLoggedIn,
  protect,
} = require(`${__dirname}/../controllers/authController`);

router.use(alerts);

router.get('/signup', getSignupForm);
router.get('/me', protect, getAccount);
router.get('/', isLoggedIn, getOverview);
router.get('/my-products', protect, getMyProducts);
router.get('/product/:slug', isLoggedIn, getProduct);
router.get('/login', isLoggedIn, getLoginForm);
router.post('/submit-user-data', protect, updateUserData);
module.exports = router;
