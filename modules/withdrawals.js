const ERC20 = require("../modules/erc20");
const contractABI = require("../modules/koa-combat-abi.json");
const Transaction = require("../models/transaction");
const Setting = require("../models/setting");
const { BigNumber } = require("ethers");

async function delay(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

module.exports.runWithdrawals = async function () {
  while (true) {
    await delay(5000);
    const tx = await Transaction.findOne({ status: "pending" });
    if (!tx) continue;
    try {
      tx.status = "processed";
      await tx.save();

      const token = new ERC20(
        process.env.CONTRACT_ADDRESS,
        contractABI,
        process.env.WEB3_HTTP_PROVIDER
      );

      const gasLimitSetting = await Setting.findOne({
        name: "gasLimit",
      });

      const bigAmount = BigNumber.from(tx.amount);
      const txHash = await token.transfer(
        process.env.HOT_ADDRESS,
        process.env.HOT_ADDRESS_PKEY,
        tx.address,
        bigAmount,
        gasLimitSetting.value
      );

      tx.txHash = txHash;
      await tx.save();
    } catch (e) {
      console.error("Error while processing withdrawals", e.message);
      tx.status = "failed";
      await tx.save();
    }
  }
};
