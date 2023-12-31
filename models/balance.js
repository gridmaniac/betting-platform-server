const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  amount: {
    type: String,
    default: "0",
  },
});

module.exports = mongoose.model("Balance", schema);
