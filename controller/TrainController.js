const HTTP_STATUS = require("../constants/statusCodes");
const { validationResult } = require("express-validator");
const { success, failure } = require("../utilities/common");
const TrainModel = require("../model/TrainModel");
const StationModel = require("../model/StationModel");

class Train {
  async getAll(req, res) {
    try {
      const { sortParam, sortOrder, name, page, limit } = req.query;
      if (page < 1 || limit < 0) {
        return res
          .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
          .send(failure("Page and limit values must be at least 1"));
      }
      if (
        (sortOrder && !sortParam) ||
        (!sortOrder && sortParam) ||
        (sortParam && sortParam !== "name") ||
        (sortOrder && sortOrder !== "asc" && sortOrder !== "desc")
      ) {
        return res
          .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
          .send(failure("Invalid sort parameters provided"));
      }
      const filter = {};

      if (name) {
        filter.name = { $regex: name, $options: "i" };
      }

      console.log(filter.$or);
      // console.log(typeof Object.keys(JSON.parse(JSON.stringify(filter)))[0]);
      const trainCount = await TrainModel.find({}).count();
      const trains = await TrainModel.find(filter)
        .populate("stops.station", "name location")
        .sort({
          [sortParam]: sortOrder === "asc" ? 1 : -1,
        })
        .skip((page - 1) * limit)
        .limit(limit ? limit : 10);
      // console.log(products)
      if (trains.length === 0) {
        return res.status(HTTP_STATUS.NOT_FOUND).send(
          success("No trains were found", {
            total: trainCount,
            totalPages: null,
            count: 0,
            page: 0,
            limit: 0,
            stations: [],
          })
        );
      }

      console.log(trains);

      return res.status(HTTP_STATUS.OK).send(
        success("Successfully got all trains", {
          total: trainCount,
          totalPages: limit ? Math.ceil(trainCount / limit) : null,
          count: trains.length,
          page: parseInt(page),
          limit: parseInt(limit),
          stations: trains,
        })
      );
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  // gets only one product
  async getOne(req, res) {
    try {
      const validation = validationResult(req).array();
      console.log(validation);
      if (validation.length > 0) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Failed to get the train", validation[0].msg));
      }

      const { id } = req.params;

      const train = await TrainModel.find({ _id: id }).populate(
        "stops.station",
        "name location"
      );
      console.log("train", train);
      if (train.length) {
        return res.status(HTTP_STATUS.OK).send(train[0]);
      } else {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("Failed to get the train", "train not found"));
      }
    } catch (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).send(`internal server error`);
    }
  }

  // adds
  async addOne(req, res) {
    try {
      const validation = validationResult(req).array();
      // console.log(validation);
      if (validation.length > 0) {
        return res
          .status(HTTP_STATUS.NOT_ACCEPTABLE)
          .send(failure("Failed to add train", validation[0].msg));
      }
      const { name, stops } = req.body;

      for (const stop of stops) {
        const station = await StationModel.findById(stop.station);
        if (!station) {
          return res.status(400).json({
            message: `Station with id ${stop.station} does not exist`,
          });
        }
      }

      const train = new TrainModel({
        name,
        stops,
      });
      await train.save();
      return res
        .status(HTTP_STATUS.CREATED)
        .send(success("train Added Successfully", train));
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  async delete(req, res) {
    try {
      const validation = validationResult(req).array();
      // console.log(validation);
      if (validation.length > 0) {
        return res
          .status(HTTP_STATUS.OK)
          .send(failure("Failed to delete station", validation[0].msg));
      }
      const trainId = req.params.id;
      console.log("trainId", trainId);
      // Find the item by ID and delete it
      const deletedTrain = await TrainModel.findByIdAndDelete(trainId);
      console.log("deleted item", deletedTrain);

      if (!deletedTrain) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "train not found" });
      }

      return res
        .status(HTTP_STATUS.ACCEPTED)
        .send(success("Train deleted successfully", deletedTrain));
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  // updates
  async update(req, res) {
    try {
      const trainId = req.params.id;
      const updatedTrainData = req.body;

      const validation = validationResult(req).array();

      if (validation.length > 0) {
        return res
          .status(HTTP_STATUS.OK)
          .send(failure("Failed to update station data", validation[0].msg));
      }

      const updatedTrain = await TrainModel.findByIdAndUpdate(
        trainId,
        updatedTrainData,
        // Returns the updated document
        { new: true }
      );

      if (!updatedTrain) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "train not found" });
      }
      console.log(updatedTrain);

      return res
        .status(HTTP_STATUS.ACCEPTED)
        .send(success("train updated successfully", updatedTrain));
    } catch (error) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "INTERNAL SERVER ERROR" });
    }
  }
}

const trainController = new Train();

module.exports = trainController;
