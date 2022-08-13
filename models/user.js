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
  isActive: {
    type: Boolean,
    default: false,
  },
  role: String,
});

module.exports = mongoose.model("User", schema);
