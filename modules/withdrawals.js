const ERC20 = require("../modules/erc20");
const Transaction = require("../models/transaction");
const Setting = require("../models/setting");
const Asset = require("../models/asset");
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
      const asset = await Asset.findOne({ code: tx.code });
      if (!asset.listed) throw new Error("Asset is inactive.");

      const web3HttpProvider = await Setting.findOne({
        name: "WEB3_HTTP_PROVIDER",
      });

      if (!web3HttpProvider) throw new Error("WEB3_HTTP_PROVIDER is missing.");

      tx.status = "processed";
      await tx.save();

      const token = new ERC20(
        asset.contract,
        asset.contractABI,
        web3HttpProvider.value
      );

      const gasLimitSetting = await Setting.findOne({
        name: "GAS_LIMIT",
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
