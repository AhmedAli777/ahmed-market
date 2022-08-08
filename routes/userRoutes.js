/* eslint-disable import/no-dynamic-require */
const express = require('express');

const router = express.Router();

const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
} = require(`${__dirname}/../controllers/userController`);
const {
  signup,
  login,
  protect,
  forgotPassword,
  resetPassword,
  updatePassword,
  restrictTo,
  logout,
} = require(`${__dirname}/../controllers/authController`);

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/logout').get(logout);

router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword/:resetToken').patch(resetPassword);

router.use(protect);
router.route('/me').get(getMe, getUser);
router.route('/updateMe').patch(uploadUserPhoto, resizeUserPhoto, updateMe);
router.route('/deleteMe').delete(deleteMe);
router.route('/updateMyPassword').patch(updatePassword);

router.use(restrictTo('admin'));
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
