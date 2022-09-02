const AppError = require('../utils/appError');

const MSG_UNKNOWN_ERROR = 'Unknown error occurred.';

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const transformInvalidMongoDBIdError = (error) =>
  new AppError(`Tour id: '${error.value}' not found.`, 404);

const convertMongoDBDuplicateValue = (error) => {
  const message = `Tour ${Object.keys(error.keyPattern)[0]} already exists: '${
    error.keyValue.name
  }'`;
  return new AppError(message, 400);
};

const convertMongooseValidationError = (error) => {
  const errors = Object.values(error.errors).map((el) => el.message);
  const message = `Invalid parameters. ${errors.join('. ')}.`;
  return new AppError(message, 400);
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message || MSG_UNKNOWN_ERROR,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: MSG_UNKNOWN_ERROR,
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = err;

    if (err.name === 'CastError' || err.kind === 'ObjectId') {
      error = transformInvalidMongoDBIdError(err);
    } else if (err.code === 11000) {
      error = convertMongoDBDuplicateValue(err);
    } else if (err.name === 'ValidationError') {
      error = convertMongooseValidationError(err);
    }

    sendErrorProd(error, res);
  }
};
