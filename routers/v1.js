const { Router } = require("express");
const router = new Router();
const { validateEmail, validatePassword } = require("../modules/validation");
const { makePassword, verifyPassword } = require("../modules/password");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const Event = require("../models/event");
const Fight = require("../models/fight");
const User = require("../models/user");

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

router.post("/signup", async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  const modelErrors = {};
  if (!validateEmail(email)) {
    modelErrors["email"] = "Please enter a valid email address.";
    return res.json({ modelErrors, data: false });
  }

  const count = await User.count({ email });
  if (count !== 0)
    modelErrors["email"] = "This email address is already being used.";

  const passwordError = validatePassword(password);
  if (passwordError) {
    modelErrors["password"] = passwordError;
    return res.json({ modelErrors, data: false });
  }

  if (password !== confirmPassword)
    modelErrors["confirmPassword"] = "Passwords do not match.";

  if (Object.keys(modelErrors).length > 0)
    return res.json({ modelErrors, data: false });

  const { hash, salt } = await makePassword(password);
  const user = new User({ email, hash, salt });
  await user.save();

  return res.json({ data: true });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const modelErrors = {};
  if (!validateEmail(email)) {
    modelErrors["email"] = "Please enter a valid email address.";
    return res.json({ modelErrors, data: false });
  }

  const user = await User.findOne({ email });
  if (!user)
    modelErrors["password"] =
      "Incorrect email address or password, please try again.";
  else {
    const isValid = await verifyPassword(password, user.salt, user.hash);
    if (!isValid) {
      modelErrors["password"] =
        "Incorrect email address or password, please try again";
    }
  }

  if (Object.keys(modelErrors).length > 0)
    return res.json({ modelErrors, data: false });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
  return res.json({ data: token });
});

router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    return res.json({ secret: "hello" });
  }
);

module.exports = router;
