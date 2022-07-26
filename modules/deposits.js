const EtherScan = require("./etherscan");
const mongoose = require("mongoose");
const moment = require("moment");
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

async function processTransaction(transaction) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { hash, value, from } = transaction;
    const txCount = await Transaction.count({ txHash: hash }).session(session);
    if (txCount !== 0) throw new Error(`Tx ${hash} has been already processed`);

    const user = await User.findOne({ address: from }).session(session);
    if (user === null) throw new Error(`Address ${from} not found`);

    const amount = BigNumber.from(user.balance);
    user.balance = amount.add(value);
    await user.save({ session });

    const tx = new Transaction({
      userId: user.id,
      txHash: hash,
      amount: value,
      type: "deposit",
      date: moment.utc(),
    });
    await tx.save({ session });

    await session.commitTransaction();
  } catch (e) {
    await session.abortTransaction();
    console.error("Error while processing tx", e.message);
  } finally {
    session.endSession();
  }
}

async function processTransactions(lastBlockNumber, blockNumber) {
  if (!lastBlockNumber || !blockNumber)
    throw new Error("For some reasone blockNumber was undefined");

  const transactions = await etherScan.getTokenTransactionsByAddress(
    process.env.CONTRACT_ADDRESS,
    process.env.HOT_ADDRESS,
    lastBlockNumber,
    blockNumber
  );

  for (const tx of transactions) await processTransaction(tx);
}

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
      console.error("Error while processing blocks", e.message);
    }
  }
};

module.exports.processTransactions = processTransactions;
