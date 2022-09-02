const express = require('express');

const app = express();
const morgan = require('morgan');
const tourRouter = require('./routers/tourRoutes');
const userRouter = require('./routers/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./handlers/errorHandler');

app.use(express.json());
app.use((req, res, next) => {
  console.log('Hello from the middleware 🤘');
  next();
});
app.use(express.static(`${__dirname}/public`));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use((req, res, next) => {
  req.requestedTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) =>
  next(new AppError(`'${req.originalUrl}' not found`, 404))
);

app.use(globalErrorHandler);

module.exports = app;
