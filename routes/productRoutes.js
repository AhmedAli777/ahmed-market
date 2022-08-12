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
  getAllProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  alisTopFive,
  getProductsStats,
  getMonthlyPlan,
  getProductWithin,
  getDistances,
  uploadProductImages,
  resizeProductImages,
  //checkID,
  // checkBody,
  // eslint-disable-next-line import/no-dynamic-require
} = require(`${__dirname}/../controllers/productController`);
const router = express.Router();

router.use('/:productId/reviews', reviewRouter);
router.route('/top-5-products').get(alisTopFive, getAllProducts);
router.route('/products-stats').get(getProductsStats);

router
  .route('/')
  .get(getAllProducts)
  .post(protect, restrictTo('admin'), createProduct);
router
  .route('/:id')
  .get(getProduct)
  .patch(
    // protect,
    // restrictTo('admin'),
    uploadProductImages,
    resizeProductImages,
    updateProduct
  )
  .delete(protect, restrictTo('admin'), deleteProduct);

module.exports = router;
