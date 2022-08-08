/* eslint-disable import/no-dynamic-require */
const express = require('express');

const router = express.Router();

const {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  updateUserData,
  getSignupForm,
  getMyTours,
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
router.get('/my-tours', protect, getMyTours);
router.get('/tour/:slug', isLoggedIn, getTour);
router.get('/login', isLoggedIn, getLoginForm);
router.post('/submit-user-data', protect, updateUserData);
module.exports = router;
