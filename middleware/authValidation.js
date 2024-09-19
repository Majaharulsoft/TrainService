const { body } = require("express-validator");

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
        body('passwordConfirm')
            .exists()
            .withMessage("Password was not provided")
            .bail()
            .isString()
            .withMessage("Password must be a string")
            .bail()
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Passwords do not match');
                }
                return true
            }),
        body('role')
            .isIn(['user', 'admin'])
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

module.exports = { authValidator };
