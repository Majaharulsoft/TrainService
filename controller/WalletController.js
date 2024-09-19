const HTTP_STATUS = require("../constants/statusCodes");
const { validationResult } = require("express-validator");
const { success, failure } = require("../utilities/common");
const WalletModel = require("../model/WalletModel");
const AuthModel = require("../model/AuthModel");

class Wallet {
  async getAll(req, res) {
    try {
      const { sortParam, sortOrder, page, limit } = req.query;
      if (page < 1 || limit < 0) {
        return res
          .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
          .send(failure("Page and limit values must be at least 1"));
      }
      if (
        (sortOrder && !sortParam) ||
        (!sortOrder && sortParam) ||
        (sortParam && sortParam !== "balance") ||
        (sortOrder && sortOrder !== "asc" && sortOrder !== "desc")
      ) {
        return res
          .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
          .send(failure("Invalid sort parameters provided"));
      }
      const filter = {};

      const walletCount = await WalletModel.find({}).count();
      const wallets = await WalletModel.find(filter)
        .sort({
          [sortParam]: sortOrder === "asc" ? 1 : -1,
        })
        .skip((page - 1) * limit)
        .limit(limit ? limit : 10);
      // console.log(products)
      if (wallets.length === 0) {
        return res.status(HTTP_STATUS.NOT_FOUND).send(
          success("No wallets were found", {
            total: walletCount,
            totalPages: null,
            count: 0,
            page: 0,
            limit: 0,
            stations: [],
          })
        );
      }

      console.log(wallets);

      return res.status(HTTP_STATUS.OK).send(
        success("Successfully got all wallets", {
          total: walletCount,
          totalPages: limit ? Math.ceil(walletCount / limit) : null,
          count: wallets.length,
          page: parseInt(page),
          limit: parseInt(limit),
          wallets: wallets,
        })
      );
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  async getOne(req, res) {
    try {
      const validation = validationResult(req).array();
      //   console.log(validation);
      if (validation.length > 0) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Failed to get the wallet", validation[0].msg));
      }

      const { id } = req.params;

      const user = await AuthModel.findOne({ _id: id });

      if (!user) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Failed to get the user", "user not found"));
      }

      const wallet = await WalletModel.find({ user: user.user });
      console.log("wallet", wallet);
      if (wallet.length) {
        return res.status(HTTP_STATUS.OK).send(wallet[0]);
      } else {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("Failed to get the wallet", "wallet not found"));
      }
    } catch (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).send(`internal server error`);
    }
  }

  async addBalance(req, res) {
    try {
      const validation = validationResult(req).array();
      //   console.log(validation);
      if (validation.length > 0) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Failed to update the balance", validation[0].msg));
      }
      const authId = req.params.id;
      const { balance } = req.body;

      const userAuth = await AuthModel.find({ _id: authId }).populate("user");

      if (!userAuth) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("User was not found"));
      }

      const wallet = await WalletModel.findOne({
        user: userAuth[0].user,
      }).populate("user");

      if (!wallet) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Wallet was not found"));
      }

      wallet.balance += balance;

      const balanceUpdated = await wallet.save();

      if (balanceUpdated) {
        return res
          .status(HTTP_STATUS.OK)
          .send(success("Successfully updated balance!", balanceUpdated));
      }
    } catch (error) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }
}

const walletController = new Wallet();

module.exports = walletController;
