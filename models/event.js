const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  eventId: String,
  name: String,
  startTime: Date,
  startTimeConfirmed: Boolean,
  sport: String,
  category: String,
  year: Number,
  competitors: [mongoose.Schema.Types.Mixed],
  status: String,
  winner: String,
});

schema.index({ sport: 1 });
module.exports = mongoose.model("Event", schema);
