const mongoose = require("mongoose");
const { BigNumber } = require("ethers");
const Transaction = require("../models/transaction");
const Balance = require("../models/balance");
const Event = require("../models/event");
const Bet = require("../models/bet");
const moment = require("moment");
const { processOpenBets, cancelOpenBets } = require("./bets-processor");

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
      status: "open",
      eventId: event.id,
    }).session(session);

    const poolProfits = processOpenBets(event, bets);
    for (const bet of bets) {
      bet.status = "settled";
      await bet.save({ session });
    }

    for (const code in poolProfits) {
      for (const userId in poolProfits[code]) {
        const balance = await Balance.findOne({ userId, code }).session(
          session
        );

        const profits = poolProfits[code];
        const bigBalance = BigNumber.from(balance.amount);
        balance.amount = bigBalance.add(profits[userId]);
        await balance.save({ session });

        const tx = new Transaction({
          userId,
          code,
          amount: profits[userId],
          type: "payoff",
          date: moment.utc(),
        });

        await tx.save({ session });
      }
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

    const poolRefunds = cancelOpenBets(bets);
    for (const bet of bets) {
      bet.status = "cancelled";
      await bet.save({ session });
    }

    for (const code in poolRefunds) {
      for (const userId in poolRefunds[code]) {
        const balance = await Balance.findOne({ userId, code }).session(
          session
        );

        const refunds = poolRefunds[code];
        const bigBalance = BigNumber.from(balance.amount);
        balance.amount = bigBalance.add(refunds[userId]);
        await balance.save({ session });

        const tx = new Transaction({
          userId,
          code,
          amount: refunds[userId],
          type: "refund",
          date: moment.utc(),
        });

        await tx.save({ session });
      }
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
