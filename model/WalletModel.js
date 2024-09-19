const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema({
  balance: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],
});

const WalletModel = mongoose.model("Wallet", WalletSchema);
module.exports = WalletModel;
