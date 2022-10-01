const mongoose = require("mongoose");
const moment = require("moment");

const schema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  hash: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    default: "",
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  createTime: {
    type: Date,
    default: moment.utc(),
  },
  walletLockTime: {
    type: Date,
    default: null,
  },
  role: String,
});

module.exports = mongoose.model("User", schema);
