const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please tell us your name."],
    },
    email: {
        type: String,
        required: [true, "Please provide a valid email."],
        unique: true,
        lowercase: true,
        validate: [
            validator.isEmail,
            "Please provide a valid email.",
        ],
    },
    photo: String,
    password: {
        type: String,
        required: [true, "Please provide a password."],
        minLength: [
            8,
            "Password must have atleast 8 characters.",
        ],
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, "Please confirm your password."],
        validate: {
            // this works only on CREATE and SAVE!!! we've to use save while updating; not findOneAndUpdate
            validator: function (el) {
                return el === this.password;
            },
            message: "Passwords must be same.",
        },
    },
});

userSchema.pre("save", async function (next) {
    // Only run this function if password is actually modified
    if (!this.isModified("password")) return next();

    // Hash the password with cost of 12
    // salting a password before hashing it
    this.password = await bcrypt.hash(this.password, 12);

    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword,
) {
    return await bcrypt.compare(
        candidatePassword,
        userPassword,
    );
};

const User = mongoose.model("User", userSchema);

module.exports = User;

// FAT MODELS, THIN CONTROLLERS
