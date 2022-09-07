const EtherScan = require("./etherscan");
const mongoose = require("mongoose");
const moment = require("moment");
const { BigNumber } = require("ethers");
const Setting = require("../models/setting");
const Transaction = require("../models/transaction");
const User = require("../models/user");
const Balance = require("../models/balance");
const Asset = require("../models/asset");

async function delay(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

async function processTransaction(transaction, code) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { hash, value, from } = transaction;
    if (!hash) return;

    const txCount = await Transaction.count({ txHash: hash }).session(session);
    if (txCount !== 0) return;

    const user = await User.findOne({ address: from }).session(session);
    if (user === null) throw new Error(`Address ${from} not found`);

    const balance = await Balance.findOne({ userId: user.id, code }).session(
      session
    );

    if (balance === null)
      throw new Error(`Balance for ${user.email} not found`);

    const amount = BigNumber.from(balance.amount);
    balance.amount = amount.add(value);
    await balance.save({ session });

    const tx = new Transaction({
      userId: user.id,
      txHash: hash,
      code,
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

async function processTransactions(lastBlockNumber, blockNumber, code) {
  if (!lastBlockNumber || !blockNumber)
    throw new Error("For some reason blockNumber was undefined");

  const apiUrl = await Setting.findOne({ name: "ETHERSCAN_API_URL" });
  if (!apiUrl) throw new Error("ETHERSCAN_API_URL is missing.");

  const apiKey = await Setting.findOne({ name: "ETHERSCAN_API_KEY" });
  if (!apiKey) throw new Error("ETHERSCAN_API_KEY is missing.");

  const etherScan = new EtherScan(apiUrl.value, apiKey.value);
  const asset = await Asset.findOne({ code });
  const transactions = await etherScan.getTokenTransactionsByAddress(
    asset.contract,
    process.env.HOT_ADDRESS,
    lastBlockNumber,
    blockNumber
  );

  for (const tx of transactions.filter(
    (x) => x.to === process.env.HOT_ADDRESS.toLowerCase()
  ))
    await processTransaction(tx, code);
}

module.exports.runDeposits = async function () {
  while (true) {
    await delay(30000);
    try {
      const apiUrl = await Setting.findOne({ name: "ETHERSCAN_API_URL" });
      if (!apiUrl) throw new Error("ETHERSCAN_API_URL is missing.");

      const apiKey = await Setting.findOne({ name: "ETHERSCAN_API_KEY" });
      if (!apiKey) throw new Error("ETHERSCAN_API_KEY is missing.");

      const etherScan = new EtherScan(apiUrl.value, apiKey.value);
      const blockNumber = await etherScan.getBlockNumber();
      const blockNumberSetting = await Setting.findOne({
        name: "BLOCK_NUMBER",
      });

      const confirmationNumberSetting = await Setting.findOne({
        name: "CONFIRMATION_NUMBER",
      });

      const lastBlockNumber = blockNumberSetting
        ? blockNumberSetting.value
        : blockNumber;

      const assets = await Asset.find({ listed: true });
      for (let x of assets)
        await processTransactions(
          lastBlockNumber - confirmationNumberSetting,
          blockNumber - confirmationNumberSetting,
          x.code
        );

      await Setting.findOneAndUpdate(
        { name: "BLOCK_NUMBER" },
        {
          name: "BLOCK_NUMBER",
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
