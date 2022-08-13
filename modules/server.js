const express = require("express");

const app = new express();
const router = require("../routers/v1");
const adminRouter = require("../routers/admin");

const cors = require("cors");
if (process.env.DEVELOPMENT) app.use(cors());

app.use(express.urlencoded());
app.use(express.json());

app.use("/api/v1/", router);
app.use("/api/admin/", adminRouter);
app.listen(process.env.PORT || 8080, () => {
  console.log("Server has started.");
});
