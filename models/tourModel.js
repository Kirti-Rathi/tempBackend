/* eslint-disable prefer-arrow-callback */
const mongoose = require("mongoose");
const slugify = require("slugify");
// const validator = require("validator");

// Schema
const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "A tour must have a name"], // Validator
            unique: true, // Not a validator, but it creates a unique index in the database to ensure that no two documents have the same value for a field
            maxlength: [
                40,
                "A tour name must be less than 40 characters",
            ],
            minlength: [
                10,
                "A tour name must be more than 10 characters",
            ],
            // validate: [
            //     validator.isAlpha,
            //     "Tour name must only contain characters.",
            // ],
        },
        slug: String,
        duration: {
            type: Number,
            required: [true, "A tour must have a duration"],
        },
        maxGroupSize: {
            type: Number,
            required: [
                true,
                "A tour must have a group size",
            ],
        },
        difficulty: {
            type: String,
            trim: true,
            required: [
                true,
                "A tour must have a difficulty",
            ],
            enum: {
                values: ["easy", "medium", "difficult"],
                message:
                    "Difficulty is either: easy, medium, or difficult",
            },
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, "Rating must be above 1.0"],
            max: [5, "Rating must be below 5.0"],
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, "A tour must have a price"],
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (val) {
                    // here, this only points to NEW document creation, hence, wouldn't work with update
                    return val < this.price; // priceDiscount < price
                },
                message:
                    "Discount price ({VALUE}) should be below the regular price",
            },
        },
        summary: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        imageCover: {
            type: String,
            required: [
                true,
                "A tour must have an image cover",
            ],
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false,
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// VIRTUAL PROPERTY
tourSchema.virtual("durationWeeks").get(function () {
    return this.duration / 7; //arrow function doesn't have access to 'this' keyword
});

// DOCUMENT MIDDLEWARE
// only triggered by .save() or .create() ; doesn't work with .insertMany(), .findOneAndUpdate(), etc.
// pre-save hook: runs before .save() or .create()
tourSchema.pre("save", function (next) {
    this.slug = slugify(this.name, { lower: true }); // this--> current document
    next();
});

tourSchema.pre("save", function (next) {
    console.log("Will create document...");
    next();
});

// post-save hook
tourSchema.post("save", function (doc, next) {
    console.log(doc);
    next();
});

// QUERY MIDDLEWARE
// tourSchema.pre("find", function (next) {
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } }); // this--> current query
    this.start = Date.now();
    next();
});

tourSchema.post(/^find/, function (docs, next) {
    console.log(
        `Query took ${Date.now() - this.start} milliseconds!🕑`,
    );
    // console.log(docs);
    next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre("aggregate", function (next) {
    this.pipeline().unshift({
        $match: { secretTour: { $ne: true } },
    });
    console.log(this.pipeline());
    next();
});

// Model
const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;

// 'durationWeeks' virtual property cannot be used as a query since it's not a part of our database

// fat model skinny controller
