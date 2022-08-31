const Tour = require('../modules/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

exports.prepareTop5Tours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    const features = new APIFeatures(Tour.find(), req.query);
    features.filter().sort().limitFields().paginate();

    const tours = await features.query;

    if (tours.length > 0) {
      res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
          tours: tours,
        },
      });
    } else {
      res.status(404).json({
        status: 'page_not_found',
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 'failed',
      message: 'Something wrong',
    });
  }
};

exports.getTour = async (req, res) => {
  const tour = await Tour.findById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { tour: newTour },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: 'failed',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    requiredValidators: true,
  });
  console.log(tour);
  res.status(200).json({
    status: 'success',
    data: { tour },
  });
};

exports.deleteTour = async (req, res) => {
  await Tour.findByIdAndDelete(req.params.id);
  res.status(204).json();
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      { $match: { ratingsAverage: { $gte: 4.5 } } },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          maxRating: { $max: '$price' },
          minRating: { $min: '$price' },
        },
      },
      //{ $match: { _id: { $ne: 'EASY' } } },
    ]);

    res.status(200).json({
      status: 'success',
      data: { stats },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: 'Result not found',
    });
  }
};

exports.getMonthlyPlans = async (req, res) => {
  try {
    const year = req.params.year * 1;
    console.log(new Date(`${year}-01-01`));
    const plan = await Tour.aggregate([
      { $unwind: '$startDates' },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTour: { $sum: 1 },
          tour: { $push: '$name' },
        },
      },
      { $addFields: { month: '$_id' } },
      { $project: { _id: 0 } },
    ]);

    res.status(200).json({
      status: 'success',
      data: { plan },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: 'failed',
      message: 'Result not found',
    });
  }
};
