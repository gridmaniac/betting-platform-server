const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  leagueId: String,
  name: String,
  key: String,
  source: String,
});

module.exports = mongoose.model("League", schema);
