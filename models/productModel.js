/* eslint-disable prefer-arrow-callback */
const mongoose = require('mongoose');
//const slugify = require('slugify');
// const User = require('./userModel');
//const validator = require('validator');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A prpduct must have a name'],
      //unique: [true, 'A product must have a unique name'],
      trim: true,
      maxlength: [
        20,
        ' A product name must have less  than or equal 40 characters ',
      ],
      minlength: [
        5,
        ' A product name must have more  than or equal 40 characters ',
      ],
    },

    ratingAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },

    ratingQuantity: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      required: [true, 'A product must have a price '],
    },

    summary: {
      type: String,
      trim: true,
      required: [true, 'A product must have a summary '],
    },

    description: {
      type: String,
      trim: true,
    },

    imageCover: {
      type: String,
      required: [true, 'A product must have a cover image '],
      default: 'default-cover.jpg',
    },

    images: {
      type: [String],
      default: ['default-1.jpg', 'default-2.jpg', 'default-3.jpg'],
      select: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    category: {
      type: String,
      enum: ['food', 'drink', 'general'],
      default: 'general',
      required: true,
    },
    subCategory: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'small',
      required: true,
    },
    status: {
      type: String,
      denum: ['waiting', 'approved', 'rejected'],
      default: 'waiting',
    },

    vendor: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.index({ price: 1, ratingAverage: -1 });
// eslint-disable-next-line no-unused-vars
productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});
// DOCUMENTS MIDDLEWARE

//QUERY MIDDLEWARE

productSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'vendor',
    select: 'name -__v',
  });
  next();
});

// productSchema.pre(/^find/, function (next) {
//   this.find({ approved: { $ne: true } });
//   next();
// });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
