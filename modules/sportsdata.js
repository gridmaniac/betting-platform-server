const League = require("../models/league");
const Event = require("../models/event");
const Fight = require("../models/fight");
const Fighter = require("../models/fighter");

const moment = require("moment");
const cron = require("node-cron");
const axios = require("axios");
const api = axios.create({
  baseURL: "https://api.sportsdata.io/v3/mma/scores/json/",
  params: {
    key: process.env.SPORTSDATA_API_KEY,
  },
});

async function delay(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

async function fetchLeagues() {
  try {
    const { data } = await api.get("Leagues");
    for (let x of data) {
      await League.findOneAndUpdate(
        { key: x.Key },
        {
          leagueId: x.LeagueId,
          name: x.Name,
          key: x.Key,
          source: "sportsdata",
        },
        { upsert: true }
      );
    }
  } catch (e) {
    console.log(e.message);
  }
}

async function fetchFighters() {
  try {
    const { data } = await api.get("Fighters");
    for (let x of data) {
      await Fighter.findOneAndUpdate(
        { fighterId: x.FighterId },
        {
          fighterId: x.FighterId,
          firstName: x.FirstName,
          lastName: x.LastName,
          nickname: x.Nickname,
          weightClass: x.WeightClass,
          birthDate: x.BirthDate,
          height: x.Height,
          weight: x.Weight,
          reach: x.Reach,
          wins: x.Wins,
          losses: x.Losses,
          draws: x.Draws,
          noContests: x.NoContests,
          technicalKnockouts: x.TechnicalKnockouts,
          technicalKnockoutLosses: x.TechnicalKnockoutLosses,
          submissions: x.Submissions,
          submissionLosses: x.SubmissionLosses,
          titleWins: x.TitleWins,
          titleLosses: x.TitleLosses,
          titleDraws: x.TitleDraws,
          careerStats: {
            sigStrikesLandedPerMinute: x.CareerStats.SigStrikesLandedPerMinute,
            sigStrikeAccuracy: x.CareerStats.SigStrikeAccuracy,
            takedownAverage: x.CareerStats.TakedownAverage,
            submissionAverage: x.CareerStats.SubmissionAverage,
            knockoutPercentage: x.CareerStats.KnockoutPercentage,
            technicalKnockoutPercentage:
              x.CareerStats.TechnicalKnockoutPercentage,
            decisionPercentage: x.CareerStats.DecisionPercentage,
          },
        },
        { upsert: true }
      );
    }
  } catch (e) {
    console.log(e.message);
  }
}

async function fetchEvents() {
  try {
    const leagues = await League.find({ source: "sportsdata" });
    for (let league of leagues) {
      const year = new Date().getFullYear();

      await fetchSeason(league.key, year);
      await fetchSeason(league.key, year + 1);
    }
  } catch (e) {
    console.log(e.message);
  }
}

async function fetchSeason(league, season) {
  const { data } = await api.get(`Schedule/${league}/${season}`);
  for (let o of data) {
    const { data: e } = await api.get(`Event/${o.EventId}`);
    await Event.findOneAndUpdate(
      { eventId: e.EventId },
      {
        eventId: e.EventId,
        leagueId: e.LeagueId,
        name: e.Name,
        shortName: e.ShortName,
        season: e.Season,
        dateTime: moment.utc(e.DateTime),
        status: e.Status,
      },
      { upsert: true }
    );

    for (let x of e.Fights) {
      await Fight.findOneAndUpdate(
        { fightId: x.FightId },
        {
          eventId: e.EventId,
          fightId: x.FightId,
          order: x.Order,
          status: x.Status,
          weightClass: x.WeightClass,
          cardSegment: x.CardSegment,
          referee: x.Referee,
          rounds: x.Rounds,
          resultClock: x.ResultClock,
          resultRound: x.ResultRound,
          resultType: x.ResultType,
          winnerId: x.WinnerId,
          fighters: x.Fighters.map((f) => ({
            fighterId: f.FighterId,
            firstName: f.FirstName,
            lastName: f.LastName,
            preFightWins: f.PreFightWins,
            preFightLosses: f.PreFightLosses,
            preFightDraws: f.PreFightDraws,
            winner: f.Winner,
            moneyLine: f.MoneyLine,
          })),
        },
        { upsert: true }
      );
    }

    await delay(5000);
  }
}

cron.schedule("0 * * * *", fetchLeagues);
cron.schedule("0 * * * *", fetchFighters);
cron.schedule("*/30 * * * *", fetchEvents);
