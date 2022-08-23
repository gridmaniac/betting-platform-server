const { processOpenBets } = require("../modules/bets-processor");

function runTest() {
  const event = {
    winnerId: 2,
  };

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
      userId: 2,
      type: "winner",
      winnerId: 2,
      amount: 5_600,
    },
    {
      code: "a",
      userId: 1,
      type: "winner",
      winnerId: 1,
      amount: 5_000,
    },
    {
      code: "b",
      userId: 1,
      type: "winner",
      winnerId: 1,
      amount: 5_000,
    },
    {
      code: "b",
      userId: 2,
      type: "winner",
      winnerId: 2,
      amount: 5_600,
    },
    {
      code: "b",
      userId: 3,
      type: "winner",
      winnerId: 2,
      amount: 8_250,
    },
    {
      code: "c",
      userId: 1,
      type: "winner",
      winnerId: 2,
      amount: 8_250,
    },
    {
      code: "d",
      userId: 2,
      type: "winner",
      winnerId: 1,
      amount: 5_000,
    },
    {
      code: "d",
      userId: 2,
      type: "winner",
      winnerId: 2,
      amount: 5_000,
    },
  ];

  const expectedPoolProfit = {
    a: {
      2: 15_600,
    },
    b: {
      2: 7_622,
      3: 11_228,
    },
    c: {
      1: 8_250,
    },
    d: {
      2: 10_000,
    },
  };

  const result = processOpenBets(event, bets);
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
