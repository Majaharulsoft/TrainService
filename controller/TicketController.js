const HTTP_STATUS = require("../constants/statusCodes");
const { validationResult } = require("express-validator");
const cron = require("node-cron");
const { success, failure } = require("../utilities/common");
const TicketModel = require("../model/TicketModel");
const TrainModel = require("../model/TrainModel");
const StationModel = require("../model/StationModel");

class TicketController {
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
      const ticketCount = await TicketModel.find({}).count();
      const tickets = await TicketModel.find(filter)
        .sort({
          [sortParam]: sortOrder === "asc" ? 1 : -1,
        })
        .skip((page - 1) * limit)
        .limit(limit ? limit : 10);
      // console.log(products)
      if (tickets.length === 0) {
        return res.status(HTTP_STATUS.NOT_FOUND).send(
          success("No tickets were found", {
            total: ticketCount,
            totalPages: null,
            count: 0,
            page: 0,
            limit: 0,
            stations: [],
          })
        );
      }

      console.log(tickets);

      return res.status(HTTP_STATUS.OK).send(
        success("Successfully got all tickets", {
          total: ticketCount,
          totalPages: limit ? Math.ceil(ticketCount / limit) : null,
          count: tickets.length,
          page: parseInt(page),
          limit: parseInt(limit),
          tickets: tickets,
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
          .send(failure("Failed to get the ticket", validation[0].msg));
      }

      const { id } = req.params;

      const ticket = await TicketModel.find({ _id: id });
      console.log("ticket", ticket);
      if (ticket.length) {
        return res.status(HTTP_STATUS.OK).send(ticket[0]);
      } else {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("Failed to get the station", "Station not found"));
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
          .send(failure("Failed to add station", validation[0].msg));
      }
      const { trainId, originStationId, destinationStationId, fare, qty } =
        req.body;
      const train = await TrainModel.findById(trainId);
      if (!train) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Train not found"));
      }

      const originStation = await StationModel.findById(originStationId);
      const destinationStation = await StationModel.findById(
        destinationStationId
      );
      if (!originStation || !destinationStation) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Origin or destination station not found"));
      }
      const originStop = train.stops.find(
        (stop) => stop.station._id.toString() === originStationId
      );
      const destinationStop = train.stops.find(
        (stop) => stop.station._id.toString() === destinationStationId
      );

      if (!originStop || !destinationStop) {
        return res.status(400).json({
          message: "One or both stations not part of the train route",
        });
      }

      // Calculate the duration between the origin and destination
      const durationInMilliseconds =
        destinationStop.arrivalTime - originStop.departureTime;
      const durationInHours = durationInMilliseconds / (1000 * 60 * 60); // Convert milliseconds to hours

      // Define a rate per hour
      const ratePerHour = 10;

      // Calculate the fare based on the duration and rate
      const fareBasedOnDuration = durationInHours * ratePerHour;
      const ticket = new TicketModel({
        name: `${train.name} ticket`,
        train: train._id,
        origin: originStation._id,
        destination: destinationStation._id,
        fare: fare ? fare : fareBasedOnDuration,
        qty,
      });

      // Save the ticket to the database
      await ticket.save();

      return res
        .status(HTTP_STATUS.CREATED)
        .send(success("ticket Added Successfully", ticket));
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
          .send(failure("Failed to delete ticket", validation[0].msg));
      }
      const ticketId = req.params.id;
      console.log("ticketId", ticketId);
      // Find the item by ID and delete it
      const deletedTicket = await TicketModel.findByIdAndDelete(ticketId);
      console.log("deleted item", deletedTicket);

      if (!deletedTicket) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Ticket not found" });
      }

      return res
        .status(HTTP_STATUS.ACCEPTED)
        .send(success("Ticket deleted successfully", deletedTicket));
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
      const ticketId = req.params.id;
      const updatedTicketData = req.body;

      const validation = validationResult(req).array();

      if (validation.length > 0) {
        return res
          .status(HTTP_STATUS.OK)
          .send(failure("Failed to update ticket data", validation[0].msg));
      }

      const updatedTicket = await TicketModel.findByIdAndUpdate(
        ticketId,
        updatedTicketData,
        // Returns the updated document
        { new: true }
      );

      if (!updatedTicket) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "ticket not found" });
      }
      console.log(updatedTicket);

      return res
        .status(HTTP_STATUS.ACCEPTED)
        .send(success("Ticket updated successfully", updatedTicket));
    } catch (error) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "INTERNAL SERVER ERROR" });
    }
  }

  async addTenTicketsAutomatically() {
    try {
      // Fetch all trains
      const trains = await TrainModel.find();

      if (!trains || trains.length === 0) {
        console.log("No trains found to add tickets for.");
        return;
      }

      for (const train of trains) {
        const originStation = train.stops[0].station;
        const destinationStation = train.stops[train.stops.length - 1].station;

        // Calculate the duration between the origin and destination
        const durationInMilliseconds =
          train.stops[train.stops.length - 1].arrivalTime -
          train.stops[0].departureTime;
        const durationInHours = durationInMilliseconds / (1000 * 60 * 60); // Convert milliseconds to hours

        // Define a rate per hour
        const ratePerHour = 10;

        // Calculate the fare based on the duration and rate
        const fareBasedOnDuration = durationInHours * ratePerHour;

        const ticket = new TicketModel({
          name: `${train.name} ticket`,
          train: train._id,
          origin: originStation._id,
          destination: destinationStation._id,
          fare: fareBasedOnDuration,
          qty: 10,
        });

        await ticket.save();
      }

      console.log("10 tickets added for each train successfully.");
    } catch (error) {
      console.error("Error adding 10 tickets automatically:", error);
    }
  }
}

const ticketController = new TicketController();

// Schedule the cron job to run every 24 hours
cron.schedule("0 0 * * *", () => {
  console.log("Running cron job to add 10 tickets...");
  ticketController.addTenTicketsAutomatically();
});

module.exports = ticketController;
