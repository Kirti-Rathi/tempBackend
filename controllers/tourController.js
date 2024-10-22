// const fs = require("fs");
const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
// const express = require("express");

// const tours = JSON.parse(
//     fs.readFileSync(
//         `${__dirname}/../dev-data/data/tours-simple.json`,
//         "utf-8",
//     ),
// );

// exports.checkId = (req, res, next, val) => {
//     console.log(`Tour id is: ${val}`);
//     // if (req.params.id * 1 > tours.length) {
//     //     return res.status(404).json({
//     //         status: "fail",
//     //         message: "Invalid ID",
//     //     });
//     // }
//     next();
// };

// exports.checkBody = (req, res, next) => {
//     if (!req.body.name || !req.body.price) {
//         return res.status(404).json({
//             status: "fail",
//             message:
//                 "Request body must contain both name and price",
//         });
//     }
//     next();
// };

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = "5";
    req.query.sort = "-ratingsAverage,price";
    req.query.fields =
        "name,price,ratingsAverage,summary,difficulty";
    next();
};

exports.getAllTours = catchAsync(async (req, res) => {
    //  EXECUTE QUERY

    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const tours = await features.query;

    // const tours = Tour.find()
    //     .where("difficulty")
    //     .equals("easy")
    //     .where("duration")
    //     .equals(5);

    // SEND RESPONSE
    res.status(200).json({
        status: "success",
        results: tours.length,
        data: {
            tours,
        },
    });
});
//     try {
//         //BUILD QUERY
//         //1A. FILTERING
//         // eslint-disable-next-line node/no-unsupported-features/es-syntax
//         // const queryObj = { ...req.query }; //shallow copy
//         // const excludedFields = [
//         //     "page",
//         //     "sort",
//         //     "limit",
//         //     "fields",
//         // ];
//         // excludedFields.forEach((el) => delete queryObj[el]);

//         // //1B. ADVANCED FILTERING
//         // let queryStr = JSON.stringify(queryObj);
//         // queryStr = queryStr.replace(
//         //     /\b(gt|gte|lt|lte)\b/g,
//         //     (match) => `$${match}`,
//         // );
//         // console.log(req.query, queryObj);
//         // console.log(JSON.parse(queryStr));

//         // let query = Tour.find(JSON.parse(queryStr));

//         //2. SORTING
//         // if (req.query.sort) {
//         //     const sortBy = req.query.sort
//         //         .split(",")
//         //         .join(" ");
//         //     console.log(sortBy);
//         //     query = query.sort(sortBy);
//         // } else {
//         //     query = query.sort("_id");
//         // }

//         //3. FIELD LIMITING
//         // if (req.query.fields) {
//         //     const fields = req.query.fields
//         //         .split(",")
//         //         .join(" ");
//         //     console.log(fields);
//         //     query = query.select(fields);
//         // } else {
//         //     query = query.select("-__v"); //excluding
//         // }

//         //4. PAGINATION
//         // const page = req.query.page * 1 || 1;
//         // const limit = req.query.limit * 1 || 100;
//         // const skip = (page - 1) * limit;

//         // query = query.skip(skip).limit(limit);

//         // if (req.query.page) {
//         //     const numTours = await Tour.countDocuments();
//         //     if (skip >= numTours)
//         //         throw new Error("This page doesn't exist.");
//         // }

//     } catch (err) {
//         res.status(404).json({
//             status: "fail",
//             message: err,
//         });
//     }
// };

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
        return next(
            new AppError(
                "No tour exists with that ID",
                404,
            ),
        );
    }

    res.status(200).json({
        status: "success",
        data: {
            tour,
        },
    });
});
//     try {
//     } catch (err) {
//         res.status(404).json({
//             status: "fail",
//             message: err,
//         });
//     }
// };

exports.createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
        status: "success",
        data: {
            tour: newTour,
        },
    });
});
// try {
//     // const newTour = new Tour({});
//     // newTour.save().then(); //return promise

// } catch (err) {
//     res.status(400).json({
//         status: "fail",
//         message: err,
//     });
// }
// };

exports.updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true,
        },
    );

    if (!tour) {
        return next(
            new AppError(
                "No tour exists with that ID",
                404,
            ),
        );
    }

    res.status(200).json({
        status: "success",
        data: {
            tour,
        },
    });
});
//     try {
//     } catch (err) {
//         res.status(400).json({
//             status: "fail",
//             message: err,
//         });
//     }
// };

exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(
        req.params.id,
    );

    if (!tour) {
        return next(
            new AppError(
                "No tour exists with that ID",
                404,
            ),
        );
    }

    res.status(204).json({
        status: "success",
        data: null,
    });
});
//     try {
//     } catch (err) {
//         res.status(400).json({
//             status: "fail",
//             message: err,
//         });
//     }
// };

exports.getTourStats = catchAsync(
    async (req, res, next) => {
        const stats = await Tour.aggregate([
            // stages: can be repeated
            { $match: { ratingsAverage: { $gte: 4.5 } } },
            {
                $group: {
                    _id: { $toUpper: "$difficulty" },
                    // _id: "$ratingsAverage",
                    numTours: { $sum: 1 },
                    numRatings: {
                        $sum: "$ratingsQuantity",
                    },
                    avgRating: { $avg: "$ratingsAverage" },
                    avgPrice: { $avg: "$price" },
                    minPrice: { $min: "$price" },
                    maxPrice: { $max: "$price" },
                },
            },
            { $sort: { avgPrice: 1 } }, // 1 for ascending
            // { $match: { _id: { $ne: "EASY" } } },
        ]);

        res.status(200).json({
            status: "success",
            data: {
                stats,
            },
        });
    },
);
//     try {
//     } catch (err) {
//         res.status(400).json({
//             status: "fail",
//             message: err,
//         });
//     }
// };

exports.getMonthlyPlan = catchAsync(
    async (req, res, next) => {
        const year = req.params.year * 1; // 2021

        const plan = await Tour.aggregate([
            { $unwind: "$startDates" },
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
                    _id: { $month: "$startDates" },
                    numToursStart: { $sum: 1 },
                    tours: { $push: "$name" },
                },
            },
            { $addFields: { month: "$_id" } },
            { $project: { _id: 0 } },
            { $sort: { numToursStart: -1 } },
            { $limit: 12 },
        ]);

        res.status(200).json({
            status: "success",
            data: {
                plan,
            },
        });
    },
);
//     try {
//     } catch (err) {
//         res.status(400).json({
//             status: "fail",
//             message: err,
//         });
//     }
// };

// Responding to url parameters ; '/api/v1/tours/:id/:x?'

// req.params --> all variables or URL parameters
// const id = Number(req.params.id);
// const tour = tours.find((el) => el.id === id);

// PAGINATION ISSUE? REPEATED RESULTS ON DIFFERENT PAGES?
//MongoDB does not store documents in a collection in a particular order. When sorting on a field which contains duplicate values, documents containing those values may be returned in any order.
// If consistent sort order is desired, include at least one field in your sort that contains unique values. The easiest way to guarantee this is to include the _id field in your sort query.

// So you can solve the problem by:

// Product.find({gender:'male'})
//   .sort({price: 1, _id: 1})
//   .skip(page * 25).limit(25);
