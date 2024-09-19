const mongoose = require("mongoose");

const TrainSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  stops: [
    {
      station: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Station",
        required: true,
      },
      arrivalTime: { type: Date, required: true },
      departureTime: { type: Date, required: true },
    },
  ],
});

const TrainModel = mongoose.model("Train", TrainSchema);
module.exports = TrainModel;
