/* eslint-disable node/no-unsupported-features/es-syntax */
class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = { ...this.queryString }; //shallow copy
        const excludedFields = [
            "page",
            "sort",
            "limit",
            "fields",
        ];
        excludedFields.forEach((el) => delete queryObj[el]);

        //1B. ADVANCED FILTERING
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(
            /\b(gt|gte|lt|lte)\b/g,
            (match) => `$${match}`,
        );
        console.log(this.queryString, queryObj);
        console.log(JSON.parse(queryStr));

        this.query = this.query.find(JSON.parse(queryStr));
        // let query = Tour.find(JSON.parse(queryStr));
        return this; //returns the object; makes chaining of methods possible
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort
                .split(",")
                .join(" ");
            console.log(sortBy);
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort("_id");
        }

        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields
                .split(",")
                .join(" ");
            console.log(fields);
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select("-__v"); //excluding
        }

        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;
