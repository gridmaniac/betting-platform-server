const { BigNumber } = require("ethers");
const BN = require("bignumber.js");

module.exports.processOpenBets = (event, allBets) => {
  const pools = allBets.reduce((a, b) => {
    if (b.code in a) a[b.code].push(b);
    else a[b.code] = [b];
    return a;
  }, {});

  const poolProfits = {};
  for (const code in pools) {
    const profits = {};

    // WINNER
    {
      const { winnerId } = event;
      const bets = pools[code].filter((x) => x.type === "winner");
      const positiveHouse = bets
        .filter((x) => x.winnerId === winnerId)
        .reduce((a, b) => a.add(BigNumber.from(b.amount)), BigNumber.from(0));

      const negativeHouse = bets
        .filter((x) => x.winnerId !== winnerId)
        .reduce((a, b) => a.add(BigNumber.from(b.amount)), BigNumber.from(0));

      for (const bet of bets) {
        let profit;
        if (positiveHouse.eq(0)) profit = BigNumber.from(bet.amount);
        if (bet.winnerId === winnerId) {
          const ratio = BN(bet.amount).div(positiveHouse.toString());
          profit = BigNumber.from(
            ratio.times(negativeHouse.toString()).toFixed(0)
          ).add(bet.amount);
        }

        if (profit)
          if (bet.userId in profits)
            profits[bet.userId] = profits[bet.userId].add(profit);
          else profits[bet.userId] = profit;
      }
    }

    poolProfits[code] = profits;
  }

  return poolProfits;
};

module.exports.cancelOpenBets = (allBets) => {
  const pools = allBets.reduce((a, b) => {
    if (b.code in a) a[b.code].push(b);
    else a[b.code] = [b];
    return a;
  }, {});

  const poolRefunds = {};
  for (const code in pools) {
    const refunds = {};
    for (const bet of pools[code]) {
      if (bet.userId in refunds)
        refunds[bet.userId] = refunds[bet.userId].add(bet.amount);
      else refunds[bet.userId] = BigNumber.from(bet.amount);
    }

    poolRefunds[code] = refunds;
  }

  return poolRefunds;
};
