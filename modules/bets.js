const mongoose = require("mongoose");
const { BigNumber } = require("ethers");
const BN = require("bignumber.js");
const Transaction = require("../models/transaction");
const User = require("../models/user");
const Event = require("../models/event");
const Bet = require("../models/bet");
const moment = require("moment");

async function delay(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

async function processNextClosedEvent() {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const event = await Event.findOne({
      processed: false,
      status: "closed",
    }).session(session);

    if (!event) return;
    event.processed = true;
    await event.save({ session });

    const allBets = await Bet.find({
      status: "open",
      eventId: event.id,
    }).session(session);

    const profits = {};

    // WINNER
    {
      const { winnerId } = event;
      const bets = allBets.filter((x) => x.type === "winner");
      const positiveHouse = bets
        .filter((x) => x.winnerId === bet.winnerId)
        .reduce((a, b) => a.add(BigNumber.from(b.amount)), BigNumber.from(0));

      const negativeHouse = bets
        .filter((x) => x.winnerId !== bet.winnerId)
        .reduce((a, b) => a.add(BigNumber.from(b.amount)), BigNumber.from(0));

      for (const bet of bets) {
        let profit;
        if (positiveHouse.eq(0)) profit = BigNumber.from(bet.amount);
        if (bet.winnerId === winnerId) {
          const ratio = BN(bet.amount).div(positiveHouse.toString());
          profit = BigNumber.from(
            ratio.times(negativeHouse.toString()).toFixed(0)
          ).add(bet.amount);
        }

        if (profit)
          if (bet.userId in profits)
            profits[bet.userId] = profits[bet.userId].add(profit);
          else profits[bet.userId] = profit;

        bet.status = "settled";
        await bet.save({ session });
      }
    }

    for (const userId in profits) {
      const user = await User.findById(userId).session(session);
      const bigBalance = BigNumber.from(user.balance);

      user.balance = bigBalance.add(profits[userId]);
      await user.save({ session });

      const tx = new Transaction({
        userId: userId,
        amount: profits[userId],
        type: "payoff",
        date: moment.utc(),
      });

      await tx.save({ session });
    }

    await session.commitTransaction();
  } catch (e) {
    console.error("Error while processing closed event", e.message);
    await session.abortTransaction();
  } finally {
    session.endSession();
  }
}

async function processNextCancelledEvent() {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const event = await Event.findOne({
      processed: false,
      status: "cancelled",
    }).session(session);

    if (!event) return;
    event.processed = true;
    await event.save({ session });

    const bets = await Bet.find({
      status: "open",
      eventId: event.id,
    }).session(session);

    const refunds = {};
    for (const bet of bets) {
      if (bet.userId in refunds)
        refunds[bet.userId] = refunds[bet.userId].add(bet.amount);
      else refunds[bet.userId] = BigNumber.from(bet.amount);

      bet.status = "cancelled";
      await bet.save({ session });
    }

    for (const userId in refunds) {
      const user = await User.findById(userId).session(session);
      const bigBalance = BigNumber.from(user.balance);

      user.balance = bigBalance.add(refunds[userId]);
      await user.save({ session });

      const tx = new Transaction({
        userId: userId,
        amount: refunds[userId],
        type: "refund",
        date: moment.utc(),
      });

      await tx.save({ session });
    }

    await session.commitTransaction();
  } catch (e) {
    console.error("Error while processing cancelled event", e.message);
    await session.abortTransaction();
  } finally {
    session.endSession();
  }
}

module.exports.runBets = async function () {
  while (true) {
    await delay(1000);
    try {
      await processNextClosedEvent();
      await delay(1000);
      await processNextCancelledEvent();
    } catch (e) {
      console.error("Error while processing bets", e.message);
    }
  }
};
