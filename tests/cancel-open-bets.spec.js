const { cancelOpenBets } = require("../modules/bets-processor");

function runTest() {
  const bets = [
    {
      code: "a",
      userId: 1,
      type: "winner",
      winnerId: 1,
      amount: 5_000,
    },
    {
      code: "a",
      userId: 1,
      type: "winner",
      winnerId: 2,
      amount: 5_000,
    },
    {
      code: "a",
      userId: 2,
      type: "winner",
      winnerId: 1,
      amount: 5_600,
    },
    {
      code: "b",
      userId: 1,
      type: "winner",
      winnerId: 2,
      amount: 5_000,
    },
  ];

  const expectedPoolProfit = {
    a: {
      1: 10_000,
      2: 5_600,
    },
    b: {
      1: 5_000,
    },
  };

  const result = cancelOpenBets(bets);
  console.log(
    "Codes should be the same",
    Object.keys(expectedPoolProfit).toString() ===
      Object.keys(result).toString()
  );

  for (const code of Object.keys(result)) {
    console.log(
      "User Ids are same",
      Object.keys(expectedPoolProfit[code]).join("") ===
        Object.keys(result[code]).join("")
    );

    for (const userId in result[code]) {
      console.log(
        "Profits match",
        expectedPoolProfit[code][userId].toString() ===
          result[code][userId].toString()
      );
    }
  }
}

runTest();
