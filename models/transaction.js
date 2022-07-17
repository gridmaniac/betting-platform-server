const mongoose = require("mongoose");
const moment = require("moment");

const schema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  txHash: String,
  amount: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  status: String,
  address: String,
  date: Date,
});

module.exports = mongoose.model("Transaction", schema);
