const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  txHash: String,
  code: {
    type: String,
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
  status: String,
  address: String,
  date: Date,
});

module.exports = mongoose.model("Transaction", schema);
