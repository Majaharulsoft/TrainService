const express = require("express");
const routes = express();
const TransactiontController = require("../controller/TransactionController");
const {
  isAuthorized,
  isAuthorizedUser,
} = require("../middleware/authValidationJWT");
const { transactionValidator } = require("../middleware/validation");

// gets all transaction
routes.get("/", isAuthorized, TransactiontController.getAll);

// buy ticket
routes.post(
  "/create/:id",
  isAuthorizedUser,
  transactionValidator.create,
  TransactiontController.create
);

module.exports = routes;
