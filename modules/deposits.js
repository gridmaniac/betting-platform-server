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

const etherScan = new EtherScan(
  process.env.ETHERSCAN_API_URL,
  process.env.ETHERSCAN_API_KEY
);

module.exports.processTransactions = async (lastBlockNumber, blockNumber) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const transactions = await etherScan.getTokenTransactionsByAddress(
      process.env.CONTRACT_ADDRESS,
      process.env.HOT_ADDRESS,
      lastBlockNumber,
      blockNumber
    );

    for (const tx of transactions) {
      const { hash, value, from } = tx;

      const txCount = await Transaction.count({
        txHash: hash,
        type: "deposit",
      });

      if (txCount === 0) {
        const user = await User.findOne({ address: from }).session(session);
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
    console.error("Error while processing txs", e.message);
    await session.abortTransaction();
    throw new Error("TX processing failed");
  } finally {
    session.endSession();
  }
};

module.exports.runDeposits = async function () {
  while (true) {
    await delay(30000);
    try {
      const blockNumber = await etherScan.getBlockNumber();
      const blockNumberSetting = await Setting.findOne({
        name: "blockNumber",
      });

      const lastBlockNumber = blockNumberSetting
        ? blockNumberSetting.value
        : blockNumber;

      await processTransactions(lastBlockNumber, blockNumber);
      await Setting.findOneAndUpdate(
        { name: "blockNumber" },
        {
          name: "blockNumber",
          value: blockNumber,
        },
        { upsert: true }
      );
    } catch (e) {
      console.error("Error while processing block", e.message);
    }
  }
};
