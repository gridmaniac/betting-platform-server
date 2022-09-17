const ERC20 = require("../modules/erc20");
const Ethereum = require("../modules/ethereum");
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
      const web3HttpProvider = await Setting.findOne({
        name: "WEB3_HTTP_PROVIDER",
      });

      if (!web3HttpProvider) throw new Error("WEB3_HTTP_PROVIDER is missing.");

      tx.status = "processed";
      await tx.save();

      const wallet =
        asset.type === "ethereum"
          ? new Ethereum(web3HttpProvider.value)
          : new ERC20(
              asset.contract,
              JSON.parse(asset.contractABI),
              web3HttpProvider.value
            );

      const bigAmount = BigNumber.from(tx.amount);
      const txHash = await wallet.transfer(tx.address, bigAmount);
      tx.txHash = txHash;
      await tx.save();
    } catch (e) {
      console.error("Error while processing withdrawals", e.message);
      tx.status = "failed";
      await tx.save();
    }
  }
};
