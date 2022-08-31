/**
 * Validates the request body to see if the name and price are given.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'Missing parameters',
      message: 'Name or price is missing',
    });
  }
  next();
};
