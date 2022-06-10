const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  eventId: String,
  name: String,
  startTime: Date,
  startTimeConfirmed: Boolean,
  sport: String,
  category: String,
  competitors: [mongoose.Schema.Types.Mixed],
  status: String,
  winnerId: String,
  homeScore: Number,
  awayScore: Number,
});

schema.index({ sport: 1 });
module.exports = mongoose.model("Event", schema);
