/* eslint-disable no-unused-vars */
/* eslint-disable import/no-dynamic-require */
// eslint-disable-next-line no-unused-vars
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXEPTION !');
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require(`${__dirname}/app`);
dotenv.config({ path: `./config.env` });

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    // userCreateIndexes: true,
    // useFindAndModify: false,
    //useFindAndModify: true,
  })
  .then(() => console.log('DB connection successful !'));

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`app running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNDANDLER REJECTION !');

  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
