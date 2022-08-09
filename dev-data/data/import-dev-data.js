const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../../models/productModel');
const Review = require('../../models/reviewModel');
const User = require('../../models/userModel');

dotenv.config({ path: `./config.env` });

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    // useNewUrlParser: true,
    // userCreateIndexes: true,
    // useFindAndModify: false,
  })
  .then(() => console.log('DB connection successful !'));

// READ JSON FILE
const products = JSON.parse(
  fs.readFileSync(`${__dirname}/products.json`, 'utf-8')
);
// const reviews = JSON.parse(
//   fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
// );
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

//IMPORT DATA INTO DB

const importData = async () => {
  try {
    await Product.create(products);
    //await Review.create(reviews);
    await User.create(users, { validateBeforeSave: false });
    console.log('Data successfully loadded !');
    process.exit();
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Product.deleteMany();
    await Review.deleteMany();
    await User.deleteMany();
    console.log('Data successfully deleted !');
    process.exit();
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//console.log(process.argv);

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
