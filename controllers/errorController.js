/* eslint-disable node/no-unsupported-features/es-syntax */
const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
    // console.log("Inside handle CastError🤕");
    const message = `Invalid ${err.path}: ${err.value}`;
    // console.log("message:", message);
    const appError = new AppError(message, 400); // 400 --> bad error
    // console.log(appError);
    return appError;
};

const handleDuplicateFieldsDB = (err) => {
    const value = err.keyValue.name;
    // console.log(value);
    const message = `Duplicate field value: ${value}. Please use another value.`;
    return new AppError(message, 400); // to mark isOperational = true
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(
        (el) => el.message,
    );

    const message = `Invalid input data. ${errors.join(". ")}`;
    // console.log(message);
    return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const sendErrorProd = (err, res) => {
    // Operational or trusted error: send message to client
    if (err.isOperational === true) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });

        // Programming or other unknown errors: don't leak error details
    } else {
        // 1. Log error
        console.error("Error💥: ", err);

        // 2. Send generic message
        res.status(500).json({
            status: "error",
            message: "Something went wrong!",
        });
    }
};

module.exports = (err, req, res, next) => {
    const env = process.env.NODE_ENV.trim(); // wasn't letting me enter else if block ughhhh, soab
    // console.log(err.stack);
    // console.log("INSIDE ERROR HANDLER🎉");
    // console.log(`NODE_ENV:${env}`);
    // console.log(`NODE_ENV length📏:${env.length}`);
    // console.log(`NODE_ENV: ${process.env}`);

    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (env === "development") {
        console.log("Inside dev😲");

        sendErrorDev(err, res);
    } else if (env === "production") {
        console.log("Inside prod😲");
        // let error = { ...err }; //shallow copy; error.name = undefined
        // let error = JSON.parse(JSON.stringify(err)); //deep/hard copy; doesn't copy instance
        // if (error === err) console.log("Aila💀");
        // error.name = err.name.trim();
        // error.apth = err.path;
        // error.value = err.value;

        // eslint-disable-next-line prefer-object-spread
        let error = Object.assign({}, err);
        error.name = err.name;
        error.path = err.path;
        error.value = err.value;

        // console.log(`err.name: ${err.name}`);
        // console.log(`error.name: ${error.name}`);

        if (error.name === "CastError") {
            // console.log("Cast Error🥺");
            error = handleCastErrorDB(error);
        }

        if (error.code === 11000) {
            error = handleDuplicateFieldsDB(error);
        }

        if (error.name === "ValidationError") {
            error = handleValidationErrorDB(error);
        }

        sendErrorProd(error, res);
    } else {
        console.log(
            "NODE_ENV is neither development nor production",
        );
    }
};
