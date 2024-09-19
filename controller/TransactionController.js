const HTTP_STATUS = require("../constants/statusCodes");
const { success, failure } = require("../utilities/common");

const TransactionModel = require("../model/TransactionModel");
const AuthModel = require("../model/AuthModel");
const TicketModel = require("../model/TicketModel");
const WalletModel = require("../model/WalletModel");

class TransactionController {
  async getAll(request, response) {
    try {
      let transaction;
      const { detail } = request.query;

      if (detail && detail != 1) {
        return response
          .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
          .send(failure("Invalid parameter sent"));
      }

      if (detail === "1") {
        transaction = await TransactionModel.find({})
          .populate("user")
          .populate("wallet");
        if (transaction) {
          return response.status(200).send(
            success("Successfully received all transactions", {
              result: transaction,
            })
          );
        }
        return response.status(200).send(success("No transactions were found"));
      } else {
        transaction = await TransactionModel.find({});
        if (transaction) {
          return response.status(HTTP_STATUS.OK).send(
            success("Successfully received all transactions", {
              result: transaction,
            })
          );
        }
        return response
          .status(HTTP_STATUS.OK)
          .send(success("No transactions were found"));
      }
    } catch (error) {
      console.log(error);
      return response.status(400).send(`internal server error`);
    }
  }

  // checkout
  async create(req, res) {
    try {
      const authId = req.params.id;

      const userAuth = await AuthModel.find({ _id: authId }).populate("user");
      console.log("userAuth", userAuth);
      if (!userAuth) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("User was not found"));
      }

      // const userId = userAuth[0].user._id;
      const { ticketId, qty } = req.body;

      const ticket = await TicketModel.findOne({ _id: ticketId });

      if (!ticket || ticket.qty < qty) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Ticket is not available"));
      }

      console.log("ticket", ticket);

      const wallet = await WalletModel.findOne({ user: userAuth[0].user._id });

      if (!wallet) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Wallet was not found"));
      }

      console.log("wallet", wallet);

      if (wallet.balance < ticket.fare * qty) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Insufficient balance"));
      }

      wallet.balance -= ticket.fare * qty;

      ticket.qty -= qty;
      await ticket.save();

      const transaction = new TransactionModel({
        amount: ticket.fare * qty,
        user: userAuth[0].user._id,
        wallet: wallet._id,
        tickets: [ticket._id],
      });

      // Save the transaction to the database
      await transaction.save();

      if (transaction) {
        wallet.transactions.push(transaction._id);
        await wallet.save();
        return res
          .status(HTTP_STATUS.OK)
          .send(success("Successfully checked out!", transaction));
      }

      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Something went wrong"));
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }
}

module.exports = new TransactionController();
