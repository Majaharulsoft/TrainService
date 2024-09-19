const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    wallet: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    address: {
      house: {
        type: String,
        required: false,
      },
      road: {
        type: String,
        required: false,
      },
      area: {
        type: String,
        required: false,
      },
      city: {
        type: String,
        required: false,
      },
      country: {
        type: String,
        required: false,
      },
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;
