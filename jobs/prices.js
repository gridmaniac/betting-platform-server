const EtherScan = require("../modules/etherscan");
const Setting = require("../models/setting");

module.exports.runJob = async function () {
  try {
    const apiUrl = await Setting.findOne({ name: "ETHERSCAN_API_URL" });
    if (!apiUrl) throw new Error("ETHERSCAN_API_URL is missing.");

    const apiKey = await Setting.findOne({ name: "ETHERSCAN_API_KEY" });
    if (!apiKey) throw new Error("ETHERSCAN_API_KEY is missing.");

    const etherScan = new EtherScan(apiUrl.value, apiKey.value);
    const lastPrice = await etherScan.getLastPrice();

    await Setting.findOneAndUpdate(
      { name: "ETH_PRICE" },
      {
        name: "ETH_PRICE",
        value: lastPrice.ethusd,
      },
      { upsert: true }
    );
  } catch (e) {
    console.error("Prices", e.message);
  }
};
