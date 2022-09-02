require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log(err.name, '|', err.message, '|', err.stack);
  console.log('Uncaught exception occurred. Shutting down...');

  process.exit(1);
});

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Database connection established');
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Listening to requests on port: ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, '|', err.message);
  console.log('Unhandled exception occurred. Shutting down...');

  server.close(() => {
    process.exit(1); //When running app.js with nodemon, it might not exit.
  });
});
