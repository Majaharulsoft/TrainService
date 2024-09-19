const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema({
  name: { type: String },
  train: { type: mongoose.Schema.Types.ObjectId, ref: "Train", required: true },
  origin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Station",
    required: true,
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Station",
    required: true,
  },
  fare: { type: Number, required: false },
  date: { type: Date, default: Date.now },
  qty: { type: Number, required: true, default: 1 },
});

const TicketModel = mongoose.model("Ticket", TicketSchema);
module.exports = TicketModel;
