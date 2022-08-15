/* eslint-disable no-const-assign */
/* eslint-disable arrow-body-style */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-unused-vars */
const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const User = require(`${__dirname}/../models/userModel`);
const catchAsync = require(`${__dirname}/../utils/catchAsync`);
const AppError = require(`${__dirname}/../utils/appError`);
const Email = require(`${__dirname}/../utils/email`);

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

///////////////////////////
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    photo: req.body.photo,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1) Check if email & password are written in the request
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  //2) Check if user exists & password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 400));
  }
  //3) if everything ok , send token to the client
  createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.protect = catchAsync(async (req, res, next) => {
  //1) Getting token and check  if it there
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  //console.log(req.headers);
  if (!token) {
    return next(new AppError('You are not logged in'));
  }
  //2)Varification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3)Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does not longer exist',
        401
      )
    );
  }
  //4)Check if user changed password after the token was issued

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    next(
      new AppError('User recently changed password! Pleas log in again ', 401)
    );
  }

  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles ['admin', 'lead-guide']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) Get user basd on posted mail
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('Thre is no user with this email adress'));
  }
  //2) Generate the random reset token
  const resetToken = user.creatPasswordRestToken();
  // console.log(resetToken, 'resettoken');
  await user.save({ validateBeforeSave: false });

  // 3) send token to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? submit a PATCH request with yoour new password and passwordConfirm to:\n
   ${resetURL}.\n
    If you didn't forgot your password, pleas ignore this email!`;
  try {
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordRestToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error in sending this email, Please try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) Get the user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  const user = await User.findOne({
    passwordRestToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //2) if token has not expired, and there is a user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordRestToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //3) Update changePasswordAt property for the user
  // In pre save middleware function

  //4) Log the user in, sent JWT

  createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) Get user form collection

  const user = await User.findById(req.user.id).select('+password');

  //2) Chesck if the posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password in wrong', 404));
  }

  //3) Update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.save();

  //4)Log user in, send JWT
  // createSendToken(user, 200, res);
  const token = signToken(user._id);

  res.status(200).json({
    ststus: 'success',
    token,
  });
});
