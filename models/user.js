const mongoose = require("mongoose");

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
  balance: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("User", schema);
