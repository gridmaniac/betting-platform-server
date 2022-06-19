const EtherScan = require("./etherscan");
const mongoose = require("mongoose");
const { BigNumber } = require("ethers");
const Setting = require("../models/setting");
const Transaction = require("../models/transaction");
const User = require("../models/user");

async function delay(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

async function processTransactions(transactions) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    for (const tx of transactions) {
      const { hash, value, from } = tx;

      const txCount = await Transaction.count({
        txHash: hash,
        type: "deposit",
      });

      if (txCount === 0) {
        const user = await User.findOne({ address: from });
        if (user === null) continue;

        await Transaction.findOneAndUpdate(
          { txHash: hash },
          {
            userId: user.id,
            txHash: hash,
            amount: value,
            type: "deposit",
          },
          { upsert: true, session }
        );

        const amount = BigNumber.from(user.balance);
        user.balance = amount.add(value);

        await user.save({ session });
      }
    }

    await session.commitTransaction();
  } catch (e) {
    console.error(e.message);
    await session.abortTransaction();
    throw new Error("TX processing failed");
  } finally {
    session.endSession();
  }
}

module.exports.runDeposits = async function () {
  while (true) {
    try {
      const etherScan = new EtherScan(
        process.env.ETHERSCAN_API_URL,
        process.env.ETHERSCAN_API_KEY
      );

      const blockNumberSetting = await Setting.findOne({
        name: "blockNumber",
      });

      const lastBlockNumber = blockNumberSetting
        ? blockNumberSetting.value
        : await etherScan.getBlockNumber();

      const blockNumber = await etherScan.getBlockNumber();
      const transactions = await etherScan.getTokenTransactionsByAddress(
        "0x0101c8291008edd36b42160b6f606edf2a2a7e41",
        "0xf6CDa9031f6aae3d4dc4310364699f06F51B989B",
        lastBlockNumber,
        blockNumber
      );

      await processTransactions(transactions);
      await Setting.findOneAndUpdate(
        { name: "blockNumber" },
        {
          name: "blockNumber",
          value: blockNumber,
        },
        { upsert: true }
      );

      await delay(30000);
    } catch (e) {
      console.error(e.message);
    }
  }
};
