const { Router } = require("express");
const router = new Router();
const { validateEmail, validatePassword } = require("../modules/validation");
const { makePassword, verifyPassword } = require("../modules/password");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const mongoose = require("mongoose");
const moment = require("moment");
const { BigNumber } = require("ethers");
const { sendEmailConfirmation, sendResetPassword } = require("../modules/mail");
const generator = require("generate-password");

const Event = require("../models/event");
const Season = require("../models/season");
const User = require("../models/user");
const Transaction = require("../models/transaction");
const Bet = require("../models/bet");

router.get("/seasons/:sport", async (req, res) => {
  const { sport } = req.params;
  const seasons = await Season.find({ sport }, null, {
    sort: {
      startDate: 1,
    },
  });

  res.json(seasons);
});

router.get("/events/:seasonId", async (req, res) => {
  const { seasonId } = req.params;
  const events = await Event.find({ seasonId }, null, {
    sort: {
      startTime: 1,
    },
  });

  res.json(events);
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

  sendEmailConfirmation(email, user._id);
  return res.json({ data: true });
});

router.put("/activate", async (req, res) => {
  const { confirmationCode } = req.body;

  const user = await User.findById(confirmationCode);
  if (!user) return res.json({ data: false });

  user.isActive = true;
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
  if (!user || !user.isActive)
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

router.put(
  "/password",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { id: userId } = req.user;
    const { password } = req.body;
    const modelErrors = {};

    const passwordError = validatePassword(password);
    if (passwordError) {
      modelErrors["password"] = passwordError;
      return res.json({ modelErrors, data: false });
    }

    if (Object.keys(modelErrors).length > 0)
      return res.json({ modelErrors, data: false });

    const { hash, salt } = await makePassword(password);
    const user = await User.findById(userId);
    user.hash = hash;
    user.salt = salt;
    await user.save();
    return res.json({ data: true });
  }
);

router.post("/password/reset", async (req, res) => {
  const { email } = req.body;
  const password = generator.generate({
    length: 16,
    numbers: true,
  });

  const user = await User.findOne({ email });
  if (!user) return res.json({ data: true });

  const { hash, salt } = await makePassword(password);
  user.hash = hash;
  user.salt = salt;
  await user.save();
  await sendResetPassword(user.email, password);
  return res.json({ data: true });
});

router.get(
  "/wallet",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { id: userId, address, balance } = req.user;
    const transactions = await Transaction.find({ userId }, null, {
      sort: {
        startDate: 1,
      },
    });

    const bets = await Bet.find({ userId });
    const inBets = bets.reduce(
      (a, b) => a.add(BigNumber.from(b.amount)),
      BigNumber.from(0)
    );

    res.json({
      address,
      balance,
      inBets: inBets.toString(),
      decimals: process.env.DECIMALS,
      hotAddress: process.env.HOT_ADDRESS,
      contractAddress: process.env.CONTRACT_ADDRESS,
      transactions: transactions.map((x) => ({
        txHash: x.txHash,
        amount: x.amount,
        date: x.date,
        type: x.type,
      })),
    });
  }
);

router.patch(
  "/wallet/address",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { address } = req.body;
    if (req.user.address === address) return res.json({ data: true });
    if (address !== "") {
      const count = await User.count({ address });
      if (count > 0) return res.json({ data: false });
    }

    await User.findByIdAndUpdate(req.user.id, { address });
    res.json({ data: true });
  }
);

router.post(
  "/wallet/withdraw",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { amount } = req.body;
    const { id: userId } = req.user;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const bigAmount = BigNumber.from(amount);
      if (bigAmount.lt(process.env.MIN_WITHDRAWAL))
        throw new Error(
          `Min. amount: ${process.env.MIN_WITHDRAWAL.slice(
            0,
            -process.env.DECIMALS
          )}`
        );

      const user = await User.findById(userId).session(session);
      if (!user.address) throw new Error("Wallet address was not specified.");

      const bigBalance = BigNumber.from(user.balance);
      if (bigAmount.gt(bigBalance)) throw new Error("Insufficient balance.");

      user.balance = bigBalance.sub(bigAmount);
      await user.save({ session });

      const tx = new Transaction({
        userId,
        amount: bigAmount,
        type: "withdrawal",
        status: "pending",
        address: user.address,
      });

      await tx.save({ session });
      await session.commitTransaction();
      res.json({ data: true });
    } catch (e) {
      await session.abortTransaction();
      res.json({ data: false, err: e.message });
    } finally {
      session.endSession();
    }
  }
);

router.get(
  "/bets",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { id: userId } = req.user;
    const bets = await Bet.find({ userId }, null, {
      sort: {
        startDate: 1,
      },
    });
    res.json({ data: bets });
  }
);

router.post(
  "/bets",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { id: userId } = req.user;
    const { eventId, type, amount, winnerId } = req.body;
    const modelErrors = {};

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const bigAmount = BigNumber.from(amount);
      if (bigAmount.lt(process.env.MIN_STAKE)) {
        modelErrors.amount = `Min. stake: ${process.env.MIN_STAKE.slice(
          0,
          -process.env.DECIMALS
        )}`;
        throw new Error();
      }

      const user = await User.findById(userId).session(session);
      const bigBalance = BigNumber.from(user.balance);
      if (bigAmount.gt(bigBalance)) {
        modelErrors.amount = "Insufficient balance.";
        throw new Error();
      }

      const event = await Event.findOne({ id: eventId }).session(session);
      if (
        event.status !== "not_started" ||
        moment.utc().isAfter(event.closeTime)
      )
        throw new Error("Betting on this event is already closed.");

      user.balance = bigBalance.sub(bigAmount);
      await user.save({ session });

      const season = await Season.findOne({ id: event.seasonId });
      const bet = new Bet({
        userId,
        eventId,
        type,
        amount,
        status: "open",
        winnerId,
        winner: event.competitors.find((x) => x.id === winnerId).name,
        season: season.name,
        startTime: event.startTime,
      });

      await bet.save({ session });
      const tx = new Transaction({
        userId,
        amount: bigAmount,
        type: "stake",
      });

      await tx.save({ session });
      await session.commitTransaction();
      res.json({ data: true });
    } catch (e) {
      await session.abortTransaction();
      res.json({ data: false, err: e.message, modelErrors });
    } finally {
      session.endSession();
    }
  }
);

module.exports = router;
