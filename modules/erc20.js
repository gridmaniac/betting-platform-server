const { ethers, Wallet } = require("ethers");

class ERC20 {
  constructor(tokenAddress, contractABI, httpProviderUri) {
    this.provider = new ethers.providers.getDefaultProvider(httpProviderUri);

    const wallet = new Wallet(process.env.HOT_ADDRESS_PKEY, this.provider);
    this.contract = new ethers.Contract(tokenAddress, contractABI, wallet);
  }

  async estimateGasFee(to, amount) {
    const gasPrice = await this.provider.getGasPrice();
    const gas = await this.contract.estimateGas.transfer(to, amount);
    const gasFee = gas.mul(gasPrice);
    return gasFee;
  }

  async transfer(to, amount) {
    const tx = await this.contract.transfer(to, amount);
    const { hash } = tx;
    return hash;
  }
}

module.exports = ERC20;
