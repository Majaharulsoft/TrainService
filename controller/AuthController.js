const HTTP_STATUS = require("../constants/statusCodes");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { success, failure } = require("../utilities/common");
const AuthModel = require("../model/AuthModel");
const UserModel = require("../model/UserModel");
const WalletModel = require("../model/WalletModel");

class AuthController {
  async signup(req, res) {
    try {
      const validation = validationResult(req).array();
      console.log(validation);
      if (validation.length > 0) {
        return res
          .status(HTTP_STATUS.OK)
          .send(failure("Failed to add the user", validation[0].msg));
      }

      if (req.body.role === "admin") {
        return res
          .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
          .send(failure(`Admin cannot be signed up`));
      }

      const emailCheck = await AuthModel.findOne({ email: req.body.email });
      if (emailCheck) {
        return res
          .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
          .send(failure(`User with email: ${req.body.email} already exists`));
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const user = await UserModel.create({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
      });

      // creates new user and stores
      const newUser = await AuthModel.create({
        email: req.body.email,
        password: hashedPassword,
        // role: req.body.role,
        user: user._id,
      });

      // payload, secret, JWT expiration
      // const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET, {
      //     expiresIn: process.env.JWT_EXPIRES_IN
      // })

      // newUser.password = undefined;
      // newUser.__v = undefined;
      user.__v = undefined;

      if (newUser) {
        const wallet = await WalletModel.create({
          user: user._id,
          balance: 0,
        });
        user.wallet = wallet._id;
        await user.save();
        res
          .status(HTTP_STATUS.OK)
          .send(success("Account created successfully ", { user }));
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("Account couldnt be created"));
      }
    } catch (err) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(`INTERNAL SERVER ERROR`);
    }
  }

  async login(req, res) {
    try {
      const validation = validationResult(req).array();
      if (validation.length > 0) {
        return res
          .status(HTTP_STATUS.OK)
          .send(failure("LogIn Failed", validation[0].msg));
      }
      const { email, password } = req.body;

      // check if email & pass exist
      if (!email || !password) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("please provide mail and password"));
      }

      // fetching the fields
      const user = await AuthModel.findOne({ email })
        .select("+password")
        .populate("user");
      // .populate("wallet");

      // when the user doesnt exist or pass dont match
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("wrong email or password"));
      }

      // object conversion
      const userObj = user.toObject();

      const userDatails = await UserModel.findById(user.user).populate(
        "wallet"
      );
      console.log("userDatails", userDatails);

      // const userDetails = await Auth.findOne({email})
      // .populate("user")

      // token
      const token = jwt.sign(user.toObject(), process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      // deleting unnecessary fields
      user.password = undefined;
      delete userObj.password;
      delete userObj.createdAt;
      delete userObj.updatedAt;
      delete userObj.__v;

      res.setHeader("Authorization", token);
      return res
        .status(HTTP_STATUS.OK)
        .send(success("Logged in successfully", { userObj, token }));
    } catch (err) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }
}

module.exports = new AuthController();
