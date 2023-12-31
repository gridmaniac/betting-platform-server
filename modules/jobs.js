const cron = require("node-cron");
const Setting = require("../models/setting");

module.exports.runJobs = async function () {
  const mmaCron = await Setting.findOne({ name: "MMA_CRON" });
  if (mmaCron) cron.schedule(mmaCron.value, require("../jobs/mma").runJob);

  const soccerCron = await Setting.findOne({ name: "SOCCER_CRON" });
  if (soccerCron)
    cron.schedule(soccerCron.value, require("../jobs/soccer").runJob);

  const nflCron = await Setting.findOne({ name: "NFL_CRON" });
  if (nflCron) cron.schedule(nflCron.value, require("../jobs/nfl").runJob);

  const ncaaCron = await Setting.findOne({ name: "NCAA_CRON" });
  if (ncaaCron) cron.schedule(ncaaCron.value, require("../jobs/ncaa").runJob);

  const nbaCron = await Setting.findOne({ name: "NBA_CRON" });
  if (nbaCron) cron.schedule(nbaCron.value, require("../jobs/nba").runJob);

  const pricesCron = await Setting.findOne({ name: "PRICES_CRON" });
  if (pricesCron)
    cron.schedule(pricesCron.value, require("../jobs/prices").runJob);
};
