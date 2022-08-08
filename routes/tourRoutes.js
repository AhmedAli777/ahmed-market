/* eslint-disable import/newline-after-import */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-unused-vars */
const express = require('express');

const reviewRouter = require(`${__dirname}/reviewRoutes`);

const {
  protect,
  restrictTo,
} = require(`${__dirname}/../controllers/authController`);

const {
  createReview,
} = require(`${__dirname}/../controllers/reviewController`);

const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  alisTopFive,
  getToursStats,
  getMonthlyPlan,
  getTourWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages,
  //checkID,
  // checkBody,
  // eslint-disable-next-line import/no-dynamic-require
} = require(`${__dirname}/../controllers/tourController`);
const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);
router.route('/top-5-tours').get(alisTopFive, getAllTours);
router.route('/tours-stats').get(getToursStats);
router
  .route('/monthly-plan/:year')
  .get(restrictTo('admin', 'guid', 'lead-guid'), getMonthlyPlan);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getTourWithin);

router.route('/distances/:latlng/unit/:unit').get(getDistances);

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guid'), createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(
    protect,
    restrictTo('admin', 'lead-guid'),
    uploadTourImages,
    resizeTourImages,
    updateTour
  )
  .delete(protect, restrictTo('admin', 'lead-guid'), deleteTour);

module.exports = router;
