const { body, param } = require("express-validator");
const { create } = require("../model/StationModel");

const commonValidator = {
  mongoId: [
    param("id")
      .exists()
      .withMessage("Mongo ID must be provided")
      .bail()
      .matches(/^[a-f\d]{24}$/i)
      .withMessage("ID is not in valid mongoDB format"),
  ],
};

const stationValidator = {
  create: [
    body("name")
      .exists()
      .withMessage("station name was not provided")
      .bail()
      .notEmpty()
      .withMessage("station name cannot be empty")
      .bail()
      .isString()
      .withMessage("station name must be a string"),
    body("location")
      .exists()
      .withMessage("location name was not provided")
      .bail()
      .notEmpty()
      .withMessage("location name cannot be empty")
      .bail()
      .isString()
      .withMessage("location name must be a string"),
  ],

  update: [
    body("name")
      .optional()
      .notEmpty()
      .withMessage("Name is required")
      .bail()
      .isString()
      .withMessage("name must be a string"),
    body("location")
      .optional()
      .notEmpty()
      .withMessage("location is required")
      .bail()
      .isString()
      .withMessage("location must be a string"),
  ],
};

const ticketValidator = {
  create: [
    body("trainId")
      .notEmpty()
      .withMessage("Train ID is required")
      .isMongoId()
      .withMessage("Train ID must be a valid MongoDB ObjectId"),

    body("originStationId")
      .notEmpty()
      .withMessage("Origin Station ID is required")
      .isMongoId()
      .withMessage("Origin Station ID must be a valid MongoDB ObjectId"),

    body("destinationStationId")
      .notEmpty()
      .withMessage("Destination Station ID is required")
      .isMongoId()
      .withMessage("Destination Station ID must be a valid MongoDB ObjectId"),

    body("fare")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Fare must be a positive number"),

    body("date")
      .optional()
      .isISO8601()
      .withMessage("Date must be a valid ISO 8601 date"),

    body("qty")
      .notEmpty()
      .withMessage("Quantity is required")
      .isInt({ min: 1 })
      .withMessage("Quantity must be a positive integer"),
  ],
  update: [
    body("trainId")
      .optional()
      .isMongoId()
      .withMessage("Train ID must be a valid MongoDB ObjectId"),
    body("qty")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Quantity must be a positive integer"),

    body("originStationId")
      .optional()
      .isMongoId()
      .withMessage("Origin Station ID must be a valid MongoDB ObjectId"),
    body("destinationStationId")
      .optional()
      .isMongoId()
      .withMessage("Destination Station ID must be a valid MongoDB ObjectId"),

    body("fare")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Fare must be a positive number"),

    body("date")
      .optional()
      .isISO8601()
      .withMessage("Date must be a valid ISO 8601 date"),
  ],
};

const trainValidator = {
  create: [
    body("name")
      .notEmpty()
      .withMessage("Train name is required")
      .isString()
      .withMessage("Train name must be a string"),

    body("stops")
      .isArray({ min: 1 })
      .withMessage("Stops must be a non-empty array"),

    body("stops.*.station")
      .notEmpty()
      .withMessage("Station ID is required for each stop")
      .isMongoId()
      .withMessage("Station ID must be a valid MongoDB ObjectId"),

    body("stops.*.arrivalTime")
      .notEmpty()
      .withMessage("Arrival time is required for each stop")
      .isISO8601()
      .withMessage("Arrival time must be a valid ISO 8601 date"),

    body("stops.*.departureTime")
      .notEmpty()
      .withMessage("Departure time is required for each stop")
      .isISO8601()
      .withMessage("Departure time must be a valid ISO 8601 date"),

    body("stops")
      .custom((stops) => {
        for (const stop of stops) {
          if (new Date(stop.arrivalTime) >= new Date(stop.departureTime)) {
            throw new Error(
              "Departure time must be after the arrival time for each stop"
            );
          }
        }
        return true;
      })
      .withMessage(
        "Departure time must be after the arrival time for each stop"
      ),
  ],

  update: [
    body("name")
      .optional()
      .isString()
      .withMessage("Train name must be a string"),

    body("stops")
      .optional()
      .isArray({ min: 1 })
      .withMessage("Stops must be a non-empty array"),
  ],
};

const transactionValidator = {
  create: [
    body("amount")
      .notEmpty()
      .withMessage("Amount is required")
      .isFloat({ gt: 0 })
      .withMessage("Amount must be a positive number"),

    body("type")
      .optional()
      .isIn(["credit", "debit"])
      .withMessage('Type must be either "credit" or "debit"'),

    body("user")
      .notEmpty()
      .withMessage("User ID is required")
      .isMongoId()
      .withMessage("User ID must be a valid MongoDB ObjectId"),

    body("wallet")
      .optional()
      .isMongoId()
      .withMessage("Wallet ID must be a valid MongoDB ObjectId"),

    body("tickets")
      .optional()
      .isArray()
      .withMessage("Tickets must be an array of MongoDB ObjectIds")
      .custom((tickets) => {
        for (let i = 0; i < tickets.length; i++) {
          if (!mongoose.Types.ObjectId.isValid(tickets[i])) {
            throw new Error(`Ticket ID at index ${i} is not a valid ObjectId`);
          }
        }
        return true;
      }),
  ],
};

const productValidator = {
  create: [
    body("name")
      .exists()
      .withMessage("name was not provided")
      .bail()
      .notEmpty()
      .withMessage("name cannot be empty")
      .bail()
      .isString()
      .withMessage("name must be a string"),
    body("author")
      .exists()
      .withMessage("author was not provided")
      .bail()
      .notEmpty()
      .withMessage("author cannot be empty")
      .bail()
      .isString()
      .withMessage("author must be a string"),
    body("category")
      .optional()
      .exists()
      .withMessage("category was not provided")
      .bail()
      .notEmpty()
      .withMessage("category cannot be empty")
      .bail()
      .isString()
      .withMessage("category must be a string"),
    body("description")
      .exists()
      .withMessage("description was not provided")
      .bail()
      .notEmpty()
      .withMessage("description cannot be empty")
      .bail()
      .isString()
      .withMessage("description must be a string"),
    body("releaseDate")
      .exists()
      .withMessage("releaseDate was not provided")
      .bail()
      .notEmpty()
      .withMessage("releaseDate cannot be empty")
      .bail()
      .isDate({ format: "YYYY-MM-DD" })
      .withMessage("Invalid release date format (YYYY-MM-DD)"),
    body("pages")
      .notEmpty()
      .withMessage("pages cannot be empty")
      .bail()
      .isInt({ min: 1 })
      .withMessage("Pages must be a positive integer and bigger than 0"),
    body("price")
      .exists()
      .withMessage("price was not provided")
      .bail()
      .notEmpty()
      .withMessage("price cannot be empty")
      .bail()
      .isFloat({ min: 1, max: 1000 })
      .withMessage("Price must be a positive number"),
    body("stock")
      .exists()
      .withMessage("stock was not provided")
      .bail()
      .notEmpty()
      .withMessage("stock cannot be empty")
      .bail()
      .isInt({ min: 1 })
      .withMessage("Stock must be a non-negative integer"),
  ],
  update: [
    body("name")
      .optional()
      .notEmpty()
      .withMessage("Name is required")
      .bail()
      .isString()
      .withMessage("name must be a string"),
    body("author")
      .optional()
      .notEmpty()
      .withMessage("author is required")
      .bail()
      .isString()
      .withMessage("author must be a string"),
    body("category")
      .optional()
      .notEmpty()
      .withMessage("category cannot be empty")
      .bail()
      .isString()
      .withMessage("category must be a string"),
    body("description")
      .optional()
      .notEmpty()
      .withMessage("description cannot be empty")
      .bail()
      .isString()
      .withMessage("description must be a string"),
    body("releaseDate")
      .optional()
      .notEmpty()
      .withMessage("releaseDate cannot be empty")
      .bail()
      .isDate({ format: "YYYY-MM-DD" })
      .withMessage("Invalid release date format (YYYY-MM-DD)"),
    body("pages")
      .optional()
      .notEmpty()
      .withMessage("pages cannot be empty")
      .bail()
      .isInt({ min: 1 })
      .withMessage("Pages must be a positive integer and bigger than 0"),
    body("price")
      .optional()
      .notEmpty()
      .withMessage("price cannot be empty")
      .bail()
      .isFloat({ min: 1, max: 1000 })
      .withMessage("Price must be a positive number"),
    body("stock")
      .optional()
      .notEmpty()
      .withMessage("stock cannot be empty")
      .bail()
      .isInt({ min: 1 })
      .withMessage("Stock must be a non-negative integer"),
  ],
  delete: [
    param("id")
      .exists()
      .withMessage("Product ID must be provided")
      .bail()
      .matches(/^[a-f\d]{24}$/i)
      .withMessage("ID is not in valid mongoDB format"),
  ],
};

const userValidator = {
  create: [
    body("name")
      .exists()
      .withMessage("name was not provided")
      .bail()
      .notEmpty()
      .withMessage("name cannot be empty")
      .bail()
      .isString()
      .withMessage("name must be a string"),
    body("email")
      .exists()
      .withMessage("Email was not provided")
      .bail()
      .notEmpty()
      .withMessage("Email cannot be empty")
      .bail()
      .isString()
      .withMessage("Email must be a string")
      .bail()
      .isEmail()
      .withMessage("Email format is incorrect"),
    body("phone")
      .exists()
      .withMessage("Phone number was not provided")
      .bail()
      .notEmpty()
      .withMessage("Phone number cannot be empty")
      .bail()
      .isString()
      .withMessage("Phone number must be a string")
      .bail()
      .isMobilePhone()
      .withMessage("Phone number format is incorrect"),
  ],
  update: [
    body("name")
      .optional()
      .notEmpty()
      .withMessage("Name is required")
      .bail()
      .isString()
      .withMessage("name must be a string"),
    body("email")
      .optional()
      .notEmpty()
      .withMessage("email is required")
      .bail()
      .isString()
      .withMessage("email must be a string")
      .bail()
      .isEmail()
      .withMessage("Email format is incorrect"),
    body("phone")
      .optional()
      .notEmpty()
      .withMessage("phone number cannot be empty")
      .bail()
      .isString()
      .withMessage("phone number must be a string")
      .bail()
      .isMobilePhone()
      .withMessage("Phone number format is incorrect"),
    body("gender")
      .optional()
      .notEmpty()
      .withMessage("gender cannot be empty")
      .bail()
      .isIn(["male", "female", "other"])
      .withMessage("Gender must be male, female or other"),
    body("address.area")
      .optional()
      .notEmpty()
      .withMessage("area cannot be empty")
      .bail()
      .isString()
      .withMessage("area must be a string"),
    body("address.city")
      .optional()
      .notEmpty()
      .withMessage("city cannot be empty")
      .bail()
      .isString()
      .withMessage("area must be a string"),
    body("address.country")
      .optional()
      .notEmpty()
      .withMessage("country cannot be empty")
      .bail()
      .isString()
      .withMessage("area must be a string"),
  ],
  delete: [
    param("id")
      .exists()
      .withMessage("User ID must be provided")
      .bail()
      .matches(/^[a-f\d]{24}$/i)
      .withMessage("ID is not in valid mongoDB format"),
  ],
};

const authValidator = {
  create: [
    body("email")
      .exists()
      .withMessage("Email was not provided")
      .bail()
      .notEmpty()
      .withMessage("Email cannot be empty")
      .bail()
      .isString()
      .withMessage("Email must be a string")
      .bail()
      .isEmail()
      .withMessage("Email format is incorrect"),
    body("password")
      .exists()
      .withMessage("Password was not provided")
      .bail()
      .isString()
      .withMessage("Password must be a string")
      .bail()
      .isStrongPassword({
        minLength: 8,
        minNumbers: 1,
        minLowercase: 1,
        minUppercase: 1,
        minSymbols: 1,
      })
      .withMessage(
        "Password must contain 8 characters, a small letter, a capital letter, a symbol and a number"
      ),
    body("passwordConfirm")
      .exists()
      .withMessage("Confirm Password was not provided")
      .bail()
      .isString()
      .withMessage("Password must be a string")
      .bail()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match");
        }
        return true;
      }),
    body("role")
      .optional()
      .isIn(["user", "admin"])
      .withMessage("Role must be user or admin"),
  ],
  login: [
    body("email")
      .exists()
      .withMessage("Email was not provided")
      .bail()
      .notEmpty()
      .withMessage("Email cannot be empty"),
    body("password")
      .exists()
      .withMessage("Password was not provided")
      .bail()
      .isString()
      .withMessage("Password must be a string"),
  ],
};

const walletValidator = {
  create: [
    body("balance")
      .isFloat({ min: 10, max: 10000 })
      .withMessage("Balance must be between 10 and 10000."),
  ],
};

module.exports = {
  productValidator,
  userValidator,
  authValidator,
  commonValidator,
  stationValidator,
  ticketValidator,
  trainValidator,
  transactionValidator,
  walletValidator,
};
