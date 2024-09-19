const express = require("express");
const routes = express();
const UserController = require("../controller/UserController");

const {
  isAuthorized,
  isAuthorizedUser,
} = require("../middleware/authValidationJWT");
const { userValidator, commonValidator } = require("../middleware/validation");

// gets all user data
routes.get("/", isAuthorized, UserController.getAll);

// get one user data
routes.get(
  "/:id",
  isAuthorizedUser,
  commonValidator.mongoId,
  UserController.getOne
);

// // adds balance to user
// routes.patch("/add-balance/:id", isAuthorizedUser, UserController.addBalance);

// updates user data
routes.patch(
  "/auth/update/:id",
  isAuthorizedUser,
  userValidator.update,
  UserController.update
);

// updates user data
routes.patch(
  "/auth/update-user-by-admin/:id",
  isAuthorized,
  userValidator.update,
  UserController.updateUserByAdmin
);

module.exports = routes;
