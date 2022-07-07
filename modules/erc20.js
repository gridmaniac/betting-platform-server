const Web3 = require("web3");

class ERC20 {
  constructor(tokenAddress, contractABI, httpProviderUri) {
    this.web3 = new Web3(new Web3.providers.HttpProvider(httpProviderUri));
    this.contract = new this.web3.eth.Contract(contractABI, tokenAddress);
    this.tokenAddress = tokenAddress;
  }

  async transfer(from, privateKey, to, amount) {
    const gasPrice = await this.web3.eth.getGasPrice();
    const data = this.contract.methods
      .transfer(to, this.web3.utils.toHex(amount))
      .encodeABI();

    const txObj = {
      gas: this.web3.utils.toHex(100000),
      gasPrice,
      to: this.tokenAddress,
      value: "0x0",
      data,
      from,
    };

    const signedTx = await this.web3.eth.accounts.signTransaction(
      txObj,
      privateKey
    );

    const tx = await this.web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );

    const { transactionHash } = tx;
    return transactionHash;
  }
}

module.exports = ERC20;
