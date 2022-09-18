const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
  },
  listed: {
    type: Boolean,
    default: false,
  },
  contract: String,
  contractABI: String,
  decimals: {
    type: Number,
    required: true,
  },
  minWithdrawal: {
    type: String,
    required: true,
  },
  minStake: {
    type: String,
    required: true,
  },
  ethTax: {
    type: String,
    default: 0,
  },
});

module.exports = mongoose.model("Asset", schema);
