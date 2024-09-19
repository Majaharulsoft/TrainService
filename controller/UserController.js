const { success, failure } = require("../utilities/common");
const { validationResult } = require("express-validator");
const HTTP_STATUS = require("../constants/statusCodes");
const UserModel = require("../model/UserModel");
const AuthModel = require("../model/AuthModel");

class UserController {
  async getAll(request, response) {
    let user;
    try {
      user = await UserModel.find({}).select("-__v");

      // console.log(transaction[0].products);
      if (user) {
        return response.status(HTTP_STATUS.OK).send(
          success("Successfully received all users", {
            result: user,
          })
        );
      } else {
        return response
          .status(HTTP_STATUS.OK)
          .send("data could not be fetched");
      }
    } catch (error) {
      return response.status(400).send(`internal server error`);
    }
  }

  // gets only one product
  async getOne(req, res) {
    try {
      const validation = validationResult(req).array();

      if (validation.length > 0) {
        return res
          .status(HTTP_STATUS.OK)
          .send(failure("Failed to get user data", validation[0].msg));
      }
      const { id } = req.params;
      console.log(id);

      const authUser = await AuthModel.find({ _id: id }).populate("user");
      console.log(authUser);

      const user = await UserModel.find({ _id: authUser[0].user._id }).populate(
        "wallet"
      );
      console.log(user);

      if (user.length) {
        return res.status(HTTP_STATUS.OK).send(user[0]);
      }
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("User not found"));
    } catch (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).send(`internal server error`);
    }
  }

  // updates
  async update(req, res) {
    try {
      const validation = validationResult(req).array();

      if (validation.length > 0) {
        return res
          .status(HTTP_STATUS.OK)
          .send(failure("Failed to update data", validation[0].msg));
      }

      const authId = req.params.id;
      const userAuth = await AuthModel.find({ _id: authId }).populate("user");
      const userId = userAuth[0].user._id;
      console.log("user id", userId);

      const updatedUserData = req.body;

      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        updatedUserData,
        // Returns the updated document
        { new: true }
      );

      if (!updatedUser) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "User not found" });
      }
      console.log(updatedUser);
      updatedUser.__v = undefined;
      return res
        .status(HTTP_STATUS.ACCEPTED)
        .send(success("User data updated successfully", updatedUser));
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "INTERNAL SERVER ERROR" });
    }
  }

  // updates
  async updateUserByAdmin(req, res) {
    try {
      const validation = validationResult(req).array();

      if (validation.length > 0) {
        return res
          .status(HTTP_STATUS.OK)
          .send(failure("Failed to update data", validation[0].msg));
      }

      const userId = req.params.id;
      console.log("user id", userId);

      const updatedUserData = req.body;

      console.log("updatedUser", updatedUserData);

      let updatedUser;

      updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        updatedUserData,
        // Returns the updated document
        { new: true }
      );

      if (!updatedUser) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "property cannot be updated" });
      }
      console.log(updatedUser);
      updatedUser.__v = undefined;
      return res
        .status(HTTP_STATUS.ACCEPTED)
        .send(success("user data updated successfully", updatedUser));
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "INTERNAL SERVER ERROR" });
    }
  }
}

module.exports = new UserController();
