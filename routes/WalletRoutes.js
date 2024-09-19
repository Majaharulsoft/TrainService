const express = require("express");
const routes = express();
const WalletController = require("../controller/WalletController");
const { walletValidator } = require("../middleware/validation");

const {
  isAuthorized,
  isAuthorizedUser,
} = require("../middleware/authValidationJWT");

// gets all data
routes.get("/all", isAuthorized, WalletController.getAll);

// get one data
routes.get("/:id", isAuthorizedUser, WalletController.getOne);

// adds balance to user
routes.patch(
  "/add-balance/:id",
  isAuthorizedUser,
  walletValidator.create,
  WalletController.addBalance
);

module.exports = routes;
