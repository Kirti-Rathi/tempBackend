const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

process.on("uncaughtException", (err) => {
    console.log("UNHANDLED REJECTION! Shutting down...💥");
    console.log(`${err.name}: ${err.message}`);
    process.exit(1);
    // server.close(() => {
    //     process.exit(1); //necessary to crash our application
    // });
});

const app = require("./app");

const DB = process.env.DATABASE.replace(
    "<PASSWORD>",
    process.env.DATABASE_PASSWORD,
);

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
    })
    .then(() => console.log("DB connection successful!🙌"));

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
    console.log(`Servering on port:${port}`);
});

// Errors Outside Express: Unhandled Rejections
process.on("unhandledRejection", (err) => {
    // console.log(`${err.name}`);
    console.log("UNHANDLED REJECTION! Shutting down...💥");
    console.log(`${err.name}: ${err.message}`);
    console.log(err);

    server.close(() => {
        process.exit(1); // CRASHING APP; to shut down the application (optional)
        // 0 --> success
        // 1 --> uncaught exception
    });
});

// Handling uncaught exceptions --> bugs in synchronous code that isn't handled.
// process.on("uncaughtException", (err) => {
//     console.log("UNHANDLED REJECTION! Shutting down...💥");
//     console.log(`${err.name}: ${err.message}`);
//     server.close(() => {
//         process.exit(1); //necessary to crash our application
//     });
// });

// console.log(x); // throw ReferenceError

// reads all env variables from config.env to node env variables
// read env variables before requiring app; ORDER MATTERS
// Environment variables--> development and production (mainly used)
// console.log(app.get("env")); // development (comes by default for express)
// console.log(process.env); // all of node environments
