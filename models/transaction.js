const mongoose = require("mongoose");
const moment = require("moment");

const schema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  txHash: {
    type: String,
    unique: true,
    required: true,
  },
  amount: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: moment.utc(),
  },
});

module.exports = mongoose.model("Transaction", schema);
