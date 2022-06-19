const axios = require("axios");

class EtherScan {
  constructor(baseURL, apiKey) {
    this.api = axios.create({
      baseURL,
      params: { apikey: apiKey },
    });
  }

  async getBlockNumber() {
    const { data } = await this.api({
      method: "get",
      params: {
        module: "proxy",
        action: "eth_blockNumber",
      },
    });
    return parseInt(data.result, 16);
  }

  async getTokenTransactionsByAddress(
    contractAddress,
    address,
    startBlock,
    endBlock
  ) {
    const { data } = await this.api({
      method: "get",
      params: {
        module: "account",
        action: "tokentx",
        contractaddress: contractAddress,
        address,
        startblock: startBlock,
        endBlock: endBlock,
      },
    });
    return data.result;
  }
}

module.exports = EtherScan;
