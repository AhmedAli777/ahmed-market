/* eslint-disable no-unused-vars */
/* eslint-disable import/no-dynamic-require */
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require(`${__dirname}/utils/appError`);
const globalErrorHandler = require(`${__dirname}/controllers/errorController`);
const productRouter = require(`${__dirname}/routes/productRoutes`);
const userRouter = require(`${__dirname}/routes/userRoutes`);
const reviewRouter = require(`${__dirname}/routes/reviewRoutes`);
const bookingRouter = require(`${__dirname}/routes/bookingRoutes`);
const bookingController = require('./controllers/bookingController');

const viewRouter = require(`${__dirname}/routes/viewRoutes`);

const app = express();
app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors());
// Access-Control-Allow-Origin *
// api.naproducts.com, front-end naproducts.com
// app.use(cors({
//   origin: 'https://www.naproducts.com'
// }))

app.options('*', cors());

//Serving static files

app.use(express.static(path.join(__dirname, 'public')));

//Set a security http methods
// app.use(helmet({ crossOriginEmbedderPolicy: false }));

//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, Please try agaim in an hour !',
});
app.use('/api', limiter);

//stripe
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);
//Body barser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data sanitization against XSS
app.use(xss());

//Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGreupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use(compression());

//Test middilwares
// app.use((req, res, next) => {
//   console.log('hello form the middleware !');
//   next();
// });

// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOStrinproductRouterg();
//   next();
// });

// 3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server !`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
