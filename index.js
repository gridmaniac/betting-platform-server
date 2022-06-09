require("./modules/db");
require("./modules/auth");
require("./modules/server");
require("./modules/sportradar");

process.on("uncaughtException", function (err) {
  console.log(err);
});
