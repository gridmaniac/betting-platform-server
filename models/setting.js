const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
  },
  value: String,
});

module.exports = mongoose.model("Setting", schema);
