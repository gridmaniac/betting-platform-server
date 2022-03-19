const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  fighterId: String,
  firstName: String,
  lastName: String,
  nickname: String,
  weightClass: String,
  birthDate: String,
  height: Number,
  weight: Number,
  reach: Number,
  wins: Number,
  losses: Number,
  draws: Number,
  noContests: Number,
  technicalKnockouts: Number,
  technicalKnockoutLosses: Number,
  submissions: Number,
  submissionLosses: Number,
  titleWins: Number,
  titleLosses: Number,
  titleDraws: Number,
  careerStats: new mongoose.Schema({
    sigStrikesLandedPerMinute: Number,
    sigStrikeAccuracy: Number,
    takedownAverage: Number,
    submissionAverage: Number,
    knockoutPercentage: Number,
    technicalKnockoutPercentage: Number,
    decisionPercentage: Number,
  }),
});

module.exports = mongoose.model("Fighter", schema);
