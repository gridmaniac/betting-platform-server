const cron = require("node-cron");

require("./modules/db");
require("./modules/auth");
require("./modules/server");
require("./modules/sportradar");

process.on("uncaughtException", function (err) {
  console.log(err);
});

require("./jobs/soccer").runJob();

if (process.env.MMA_CRON)
  cron.schedule(process.env.MMA_CRON, require("./jobs/mma").runJob);

if (process.env.SOCCER_CRON)
  cron.schedule(process.env.SOCCER_CRON, require("./jobs/soccer").runJob);
