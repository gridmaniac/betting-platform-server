const express = require("express");

const app = new express();
const router = require("../routers/v1");

app.use("/api/v1/", router);
app.listen(process.env.PORT || 8080, () => {
  console.log("Server has started.");
});
