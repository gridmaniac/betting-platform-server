const { ethers, Wallet } = require("ethers");

class Ethereum {
  constructor(httpProviderUri) {
    this.provider = new ethers.providers.getDefaultProvider(httpProviderUri);
    this.wallet = new Wallet(process.env.HOT_ADDRESS_PKEY, this.provider);
  }

  async estimateGasFee(to, value) {
    const gasPrice = await this.provider.getGasPrice();
    const gas = await this.wallet.estimateGas({ to, value });
    const gasFee = gas.mul(gasPrice);
    return gasFee;
  }

  async transfer(to, value) {
    const tx = await this.wallet.sendTransaction({ to, value });
    const { hash } = tx;
    return hash;
  }
}

module.exports = Ethereum;
