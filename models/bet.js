const mongoose = require("mongoose");
const moment = require("moment");

const schema = new mongoose.Schema({
  userId: String,
  eventId: String,
  date: Date,
  type: String,
  amount: Number,
  status: String,
  winnerId: String,
  winner: String,
  season: String,
  startTime: Date,
});

module.exports = mongoose.model("Bet", schema);
