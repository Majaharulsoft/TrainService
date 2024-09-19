const express = require("express");
const routes = express();
const TicketController = require("../controller/TicketController");
const {
  commonValidator,
  ticketValidator,
} = require("../middleware/validation");

const { isAuthorized } = require("../middleware/authValidationJWT");

// gets all data
routes.get("/all", TicketController.getAll);

// get one data
// routes.get("/:id", productValidator.delete, ProductController.getOne);
routes.get("/:id", commonValidator.mongoId, TicketController.getOne);

// deletes
routes.delete(
  "/:id",
  isAuthorized,
  commonValidator.mongoId,
  TicketController.delete
);

// add
routes.post(
  "/add",
  isAuthorized,
  ticketValidator.create,
  TicketController.addOne
);

// partial update
routes.patch(
  "/:id",
  isAuthorized,
  ticketValidator.update,
  TicketController.update
);

module.exports = routes;
