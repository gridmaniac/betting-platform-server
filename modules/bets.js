const mongoose = require("mongoose");
const { BigNumber } = require("ethers");
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

    const bets = await Bet.find({
      eventId: event.id,
    }).session(session);

    for (const bet of bets) {
      switch (bet.type) {
        case "winner":
          const { winnerId } = event;
          if (bet.winnerId !== winnerId) break;
          const pool = bets.filter((x = x.type === bet.type));
          const positiveHouse = pool
            .filter(x.winnerId === bet.winnerId)
            .reduce(
              (a, b) => a.add(BigNumber.from(b.amount)),
              BigNumber.from(0)
            );

          const negativeHouse = pool
            .filter(x.winnerId !== bet.winnerId)
            .reduce(
              (a, b) => a.add(BigNumber.from(b.amount)),
              BigNumber.from(0)
            );

          const ratio = BigNumber.from(bet.amount).div(positiveHouse);
          const profit = ratio.mul(negativeHouse);

          const user = await User.findById(bet.userId).session(session);
          const bigBalance = BigNumber.from(user.balance);

          user.balance = bigBalance.add(profit);
          await user.save({ session });

          const tx = new Transaction({
            userId,
            amount: profit,
            type: "payoff",
            date: moment.utc(),
          });

          await tx.save({ session });
          break;
      }

      bet.status = "settled";
      await bet.save({ session });
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
      eventId: event.id,
    }).session(session);

    for (const bet of bets) {
      const user = await User.findById(bet.userId).session(session);
      const bigBalance = BigNumber.from(user.balance);

      user.balance = bigBalance.add(bet.amount);
      await user.save({ session });

      const tx = new Transaction({
        userId,
        amount: bet.amount,
        type: "refund",
        date: moment.utc(),
      });

      await tx.save({ session });

      bet.status = "cancelled";
      await bet.save({ session });
    }

    await session.commitTransaction();
  } catch (e) {
    console.error("Error while processing closed event", e.message);
    await session.abortTransaction();
  } finally {
    session.endSession();
  }
}

module.exports.runBets = async function () {
  while (true) {
    await delay(1000);
    try {
      processNextClosedEvent();
      await delay(1000);
      processNextCancelledEvent();
    } catch (e) {
      console.error("Error while processing bets", e.message);
    }
  }
};
