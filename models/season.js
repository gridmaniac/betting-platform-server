const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  id: String,
  competitionId: String,
  name: String,
  startDate: Date,
  endDate: Date,
  sport: String,
});

module.exports = mongoose.model("Season", schema);
