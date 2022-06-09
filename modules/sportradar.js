const Event = require("../models/event");

const moment = require("moment");
const cron = require("node-cron");
const axios = require("axios");
const api = axios.create({
  baseURL: "https://api.sportradar.com/mma/trial/v2/en",
  params: {
    api_key: process.env.SPORTRADAR_API_KEY,
  },
});

async function delay(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

async function fetchSeasons() {
  try {
    const { data } = await api.get("seasons.json");
    const minDate = moment().subtract(1, "month");
    const seasons = data.seasons.filter((x) =>
      moment(x["start_date"]).isAfter(minDate)
    );

    for (let x of seasons) {
      const { data } = await api.get(`seasons/${x.id}/summaries.json`);
      for (let record of data.summaries) {
        const event = record["sport_event"];
        const context = event["sport_event_context"];
        const status = record["sport_event_status"];

        await Event.findOneAndUpdate(
          { eventId: record.id },
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
            winner: status["winner_id"],
          },
          { upsert: true }
        );

        await delay(1000);
      }
    }
  } catch (e) {
    console.log(e.message);
  }
}

if (process.env.NO_CRON) {
  cron.schedule("0 0 * * *", fetchSeasons);
}
