const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  id: String,
  seasonId: String,
  startTime: Date,
  startTimeConfirmed: Boolean,
  closeTime: Date,
  competitors: [mongoose.Schema.Types.Mixed],
  status: String,
  processed: {
    type: Boolean,
    default: false,
  },
  winnerId: String,
  homeScore: Number,
  awayScore: Number,
});

module.exports = mongoose.model("Event", schema);
