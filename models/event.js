const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  eventId: String,
  leagueId: String,
  name: String,
  shortName: String,
  season: Number,
  dateTime: Date,
  status: String,
});

schema.index({ season: 1 });
module.exports = mongoose.model("Event", schema);
