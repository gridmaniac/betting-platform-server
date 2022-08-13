const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  eventId: {
    type: String,
    required: true,
  },
  date: Date,
  type: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  winnerId: String,
  winner: String,
  season: String,
  startTime: Date,
});

module.exports = mongoose.model("Bet", schema);
