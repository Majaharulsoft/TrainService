const express = require("express");
const routes = express();
const StationController = require("../controller/StationController");
const {
  commonValidator,
  stationValidator,
} = require("../middleware/validation");

const { isAuthorized } = require("../middleware/authValidationJWT");

// gets all data
routes.get("/all", StationController.getAll);

// get one data
routes.get("/:id", commonValidator.mongoId, StationController.getOne);

// deletes
routes.delete(
  "/:id",
  isAuthorized,
  commonValidator.mongoId,
  StationController.delete
);

// add
routes.post(
  "/add",
  isAuthorized,
  stationValidator.create,
  StationController.addOne
);

// partial update
routes.patch(
  "/:id",
  isAuthorized,
  stationValidator.update,
  StationController.update
);

module.exports = routes;
