const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  eventId: String,
  fightId: String,
  order: Number,
  status: String,
  weightClass: String,
  cardSegment: String,
  referee: String,
  rounds: Number,
  resultClock: Number,
  resultRound: Number,
  resultType: String,
  winnerId: String,
  fighters: [
    new mongoose.Schema({
      fighterId: String,
      firstName: String,
      lastName: String,
      preFightWins: Number,
      preFightLosses: Number,
      preFightDraws: Number,
      winner: Boolean,
      moneyLine: Number,
    }),
  ],
});

module.exports = mongoose.model("Fight", schema);
