// const dotenv = require("dotenv");
const util = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

exports.signup = catchAsync(async (req, res) => {
    // anyone can be an admin using this
    // const newUser = await User.create(req.body); // User.save(req.body) can also be used

    // here we can create a user and then alter access in mongodb compass to admin
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });

    // login user as soon as they're signed up; not checking password
    const token = signToken(newUser._id);

    res.status(201).json({
        status: "success",
        token,
        data: {
            user: newUser,
        },
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1. check if email and password exists
    if (!email || !password) {
        return next(
            new AppError(
                "Please provide email and password",
                400,
            ),
        );
    }

    // 2. check if email exists && password is correct
    const user = await User.findOne({ email }).select(
        "+password",
    );
    // console.log(user);

    // "pass1234" === "$2a$12$JEUi7Axb67Pk0SZkiKzH7OvZ0A1PBiYgKfj/PRq4cwm8Rt4ZmctZK"
    if (
        !user ||
        !(await user.correctPassword(
            password,
            user.password,
        ))
    ) {
        return next(
            new AppError(
                "Incorrect email or password.",
                401,
            ),
        );
    }

    // 3. send response
    const token = signToken(user._id);
    res.status(200).json({
        status: "success",
        token,
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    // 1. Getting token and check if it's there
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    // console.log(token);

    if (!token) {
        return next(
            new AppError(
                "You are not logged in! Please login to get access",
                401,
            ),
        );
    }

    // 2. Verification (of token)
    const decoded = await util.promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET,
    );

    console.log(decoded);

    // 3. Check if the user still exists

    // 4. Check if the user changed password after the token was issued

    next();
});
