const express = require("express");
const routes = express();
const TrainController = require("../controller/TrainController");
const { commonValidator, trainValidator } = require("../middleware/validation");

const { isAuthorized } = require("../middleware/authValidationJWT");

// gets all data
routes.get("/all", TrainController.getAll);

// get one data
// routes.get("/:id", productValidator.delete, ProductController.getOne);
routes.get("/:id", commonValidator.mongoId, TrainController.getOne);

// deletes
routes.delete(
  "/:id",
  isAuthorized,
  commonValidator.mongoId,
  TrainController.delete
);

// add
routes.post(
  "/add",
  isAuthorized,
  trainValidator.create,
  TrainController.addOne
);

// partial update
routes.patch(
  "/:id",
  isAuthorized,
  trainValidator.update,
  TrainController.update
);

module.exports = routes;
