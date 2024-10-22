const express = require("express");
const morgan = require("morgan"); // HTTP request logger

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

// MIDDLEWARES
// console.log(process.env.NODE_ENV);
// process once defined is avl in every file
if (process.env.NODE_ENV === "development") {
    // console.log("Logger info📄");
    app.use(morgan("dev")); // morgan--> just like our own middleware function; logger middleware
}
app.use(express.json()); // using middleware stack by app.use()

// Serving static files from a folder, not from a route
app.use(express.static(`${__dirname}/public`)); // treats /public as root

//global middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    console.log(req.requestTime);
    next();
});

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

// HANDLING UNHANDLED ROUTES ; after all routes are handled
app.all("*", (req, res, next) => {
    // res.status(404).json({
    //     status: "fail",
    //     message: `Cannot find ${req.originalUrl} on this server!`,
    // });

    // const err = new Error(
    //     `Cannot find ${req.originalUrl} on this server!`,
    // );
    // err.status = "fail";
    // err.statusCode = 404;

    // next(err); //skips all middlewares in between and jumps to global error handling mw as error is detected

    next(
        new AppError(
            `Cannot find ${req.originalUrl} on this server!`,
            404,
        ),
    );
});

// GLOBAL ERROR HANDLING MIDDLEWARE
// console.log(typeof globalErrorHandler);
app.use(globalErrorHandler);

module.exports = app;

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// why is morgan logged at the end?
// Morgan by default is configured to run after the response ends. (So that it can log the time it took)
