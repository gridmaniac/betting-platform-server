const { Router } = require("express");
const router = new Router();

const Event = require("../models/event");
const Fight = require("../models/fight");

router.get("/events/:leagueId", async (req, res) => {
  const { leagueId } = req.params;
  const events = await Event.find({ leagueId }, null, {
    sort: {
      dateTime: 1,
    },
  });

  res.json(events);
});

router.get("/fights/:eventId", async (req, res) => {
  const { eventId } = req.params;
  const fights = await Fight.find({ eventId }, null, {
    sort: {
      order: 1,
    },
  });

  res.json(fights);
});

router.get("/signup", async (req, res) => {
  res.json({ test: true });
});

module.exports = router;
