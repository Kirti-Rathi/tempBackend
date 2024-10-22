const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Tour = require("../../models/tourModel");

dotenv.config({ path: "./config.env" });

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

// Reading file from fs
const tours = JSON.parse(
    fs.readFileSync(
        `${__dirname}/tours-simple.json`,
        "utf-8",
    ),
);

// Importing data to DB
const importData = async () => {
    try {
        await Tour.create(tours);
        console.log("Data imported successfully");
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

// Deleting all data in DB
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log("Whole Data deleted successfully");
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

if (process.argv[2] === "--import") {
    importData();
} else if (process.argv[2] === "--delete") {
    deleteData();
}

console.log(process.argv);
