const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URI, { ssl: true })
  .catch((err) => console.error(err.reason));
