class AppError extends Error {
    constructor(message, statusCode) {
        super(message); //sets message property to incoming message

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4")
            ? "fail"
            : "error";
        this.isOperational = true; // OPERATIONAL ERROR

        Error.captureStackTrace(this, this.constructor); // prevents from polluting call stack from AppError
    }
}

module.exports = AppError;
