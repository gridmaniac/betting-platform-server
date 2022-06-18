const express = require("express");

const app = new express();
const router = require("../routers/v1");

const cors = require("cors");
if (process.env.DEVELOPMENT) app.use(cors());

app.use(express.urlencoded());
app.use(express.json());

app.use("/api/v1/", router);
app.listen(process.env.PORT || 8080, () => {
  console.log("Server has started.");
});
