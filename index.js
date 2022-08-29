if (process.env.MONGODB_WITH_CERT) require("./modules/db-with-cert");
else require("./modules/db");

require("./modules/auth");
require("./modules/server");

process.on("uncaughtException", function (err) {
  console.error(err);
});

if (!process.env.DISABLE_JOBS) require("./modules/jobs").runJobs();

if (!process.env.DISABLE_DEPOSITS_MODULE)
  require("./modules/deposits").runDeposits();

if (!process.env.DISABLE_WITHDRAWALS_MODULE)
  require("./modules/withdrawals").runWithdrawals();

if (!process.env.DISABLE_BETS_MODULE) require("./modules/bets").runBets();
