const Event = require("../models/event");

const moment = require("moment");
const cron = require("node-cron");
const axios = require("axios");

const api = {
  mma: axios.create({
    baseURL: "https://api.sportradar.com/mma/trial/v2/en",
    params: {
      api_key: process.env.SPORTRADAR_MMA_API_KEY,
    },
  }),

  soccer: axios.create({
    baseURL: "https://api.sportradar.com/soccer/trial/v4/en",
    params: {
      api_key: process.env.SPORTRADAR_SOCCER_API_KEY,
    },
  }),
};

async function delay(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

async function fetchMMAEvents() {
  try {
    const { data } = await api.mma.get("seasons.json");
    const minDate = moment().subtract(1, "month");
    const seasons = data.seasons.filter((x) =>
      moment(x["start_date"]).isAfter(minDate)
    );

    for (let s of seasons) {
      const { data } = await api.mma.get(`seasons/${s.id}/summaries.json`);
      for (let record of data.summaries) {
        const event = record["sport_event"];
        const context = event["sport_event_context"];
        const status = record["sport_event_status"];

        await Event.findOneAndUpdate(
          { eventId: event.id },
          {
            eventId: event.id,
            startTime: moment.utc(event["start_time"]),
            startTimeConfirmed: event["start_time_confirmed"],
            sport: context["sport"].name,
            category: context["category"].name,
            name: context["season"].name,
            year: context["season"].year,
            competitors: event["competitors"],
            status: status["status"],
            winnerId: status["winner_id"],
            homeScore: status["winner"] === "home_team" ? 1 : 0,
            awayScore: status["winner"] === "away_team" ? 1 : 0,
          },
          { upsert: true }
        );
      }

      await delay(1000);
    }
  } catch (e) {
    console.log("MMA", e.message);
  }
}

async function fetchSoccerEvents() {
  try {
    const { data } = await api.soccer.get("seasons.json");
    const minDate = moment().subtract(1, "month");
    const seasons = data.seasons.filter((x) =>
      moment(x["start_date"]).isAfter(minDate)
    );

    for (let s of seasons) {
      const { data } = await api.soccer.get(`seasons/${s.id}/summaries.json`);
      for (let record of data.summaries) {
        const event = record["sport_event"];
        const context = event["sport_event_context"];
        const status = record["sport_event_status"];

        await Event.findOneAndUpdate(
          { eventId: event.id },
          {
            eventId: event.id,
            startTime: moment.utc(event["start_time"]),
            startTimeConfirmed: event["start_time_confirmed"],
            sport: context["sport"].name,
            category: context["category"].name,
            name: context["season"].name,
            year: context["season"].year,
            competitors: event["competitors"],
            status: status["status"],
            winnerId: status["winner_id"],
            homeScore: status["home_score"],
            awayScore: status["away_score"],
          },
          { upsert: true }
        );
      }

      await delay(1000);
    }
  } catch (e) {
    console.log("Soccer", e.message);
  }
}

if (process.env.NO_CRON) {
  cron.schedule("0 0 * * *", fetchMMAEvents);
  cron.schedule("0 1 * * *", fetchSoccerEvents);
}
