const mongoose = require("mongoose");
// const validator = require("validator")
const bcrypt = require("bcryptjs");

const authSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "please provide email"],
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 5,
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    verified: {
      type: Boolean,
      required: false,
      default: false,
    },

    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const AuthModel = mongoose.model("Auth", authSchema);
module.exports = AuthModel;
