const express = require("express");
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");

// can use object destructuring as well {getAllTours, getTours, ...}

const router = express.Router();

// Param middleware
// middleware stack--express philosophy -->  everything in pipeline
// router.param('id', tourController.checkId);

router
    .route("/tour-stats")
    .get(tourController.getTourStats);

router
    .route("/monthly-plan/:year")
    .get(tourController.getMonthlyPlan);

router
    .route("/top-5-cheap")
    .get(
        tourController.aliasTopTours,
        tourController.getAllTours,
    );

router
    .route("/")
    .get(authController.protect, tourController.getAllTours)
    .post(tourController.createTour);

router
    .route("/:id")
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour);

module.exports = router;
