const { Router } = require("express");
const router = new Router();
const passport = require("passport");
const { processTransactions } = require("../modules/deposits");
const { processOpenBets } = require("../modules/bets-processor");

const Setting = require("../models/setting");
const Asset = require("../models/asset");
const Transaction = require("../models/transaction");
const Bet = require("../models/bet");
const User = require("../models/user");
const Balance = require("../models/balance");
const Event = require("../models/event");

router.use(
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    if (req.user.role === "admin") return next();
    res.status = 403;
    res.send("Access denied.");
  }
);

router.get("/settings", async (req, res) => {
  const settings = await Setting.find({}, null, {
    sort: {
      name: 1,
    },
  });

  res.json({ data: settings });
});

router.post("/settings", async (req, res) => {
  try {
    const setting = new Setting(req.body);
    await setting.save();
    res.json({ data: true });
  } catch (e) {
    res.json({ data: false, err: e.message });
  }
});

router.put("/settings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Setting.findByIdAndUpdate(id, req.body);
    res.json({ data: true });
  } catch (e) {
    res.json({ data: false, err: e.message });
  }
});

router.delete("/settings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Setting.findByIdAndDelete(id);
    res.json({ data: true });
  } catch (e) {
    res.json({ data: false, err: e.message });
  }
});

router.get("/assets", async (req, res) => {
  const assets = await Asset.find({});
  res.json({ data: assets });
});

router.post("/assets", async (req, res) => {
  try {
    const asset = new Asset(req.body);
    await asset.save();
    res.json({ data: true });
  } catch (e) {
    res.json({ data: false, err: e.message });
  }
});

router.put("/assets/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Asset.findByIdAndUpdate(id, req.body);
    res.json({ data: true });
  } catch (e) {
    res.json({ data: false, err: e.message });
  }
});

router.post("/deposits", async (req, res) => {
  const { lastBlockNumber, blockNumber, code } = req.body;
  try {
    await processTransactions(lastBlockNumber, blockNumber, code);
  } catch (e) {
    return res.json({ data: false });
  }

  res.json({ data: true });
});

router.get("/transactions", async (req, res) => {
  const transactions = await Transaction.find({}, null, {
    sort: {
      date: -1,
    },
  });

  res.json({ data: transactions });
});

router.get("/bets", async (req, res) => {
  const bets = await Bet.find({}, null, {
    sort: {
      date: -1,
    },
  });

  res.json({ data: bets });
});

router.get("/users", async (req, res) => {
  const users = await User.find({}, null, {
    sort: {
      date: -1,
    },
  });

  res.json({ data: users });
});

router.get("/balances", async (req, res) => {
  const balances = await Balance.find({});
  res.json({ data: balances });
});

router.post("/replenish-returns", async (req, res) => {
  const events = await Event.find({
    processed: true,
    status: "closed",
  });

  for (const event of events) {
    const bets = await Bet.find({
      status: "settled",
      eventId: event.id,
    });

    processOpenBets(event, bets);
    for (const bet of bets) await bet.save();
  }

  res.json({ data: true });
});

module.exports = router;
