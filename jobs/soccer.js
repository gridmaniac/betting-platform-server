const SportRadar = require("../modules/sportradar");
const SoccerSeasonMapper = require("../mappers/SoccerSeasonMapper");
const SoccerEventMapper = require("../mappers/SoccerEventMapper");
const Event = require("../models/event");
const Season = require("../models/season");
const moment = require("moment");

module.exports.runJob = async function () {
  try {
    const mmaRadar = new SportRadar(
      "https://api.sportradar.com/soccer/trial/v4/en",
      process.env.SPORTRADAR_SOCCER_API_KEY
    );

    const minDate = moment().subtract(1, "day");
    const seasons = await mmaRadar.getSeasons();
    const competitions = process.env.SOCCER_COMPETITIONS?.split(",") || [];
    const filteredSeasons = seasons.filter((x) => {
      return (
        competitions.indexOf(x["competition_id"]) !== -1 &&
        moment(x["end_date"]).isAfter(minDate)
      );
    });

    for (const season of filteredSeasons) {
      const { dto } = new SoccerSeasonMapper(season);
      await Season.findOneAndUpdate({ id: dto.id }, dto, {
        upsert: true,
      });

      const summaries = await mmaRadar.getSeasonSummaries(dto.id);
      for (const record of summaries) {
        const { dto } = new SoccerEventMapper(record);
        const session = await Event.startSession();
        await session.withTransaction(async () => {
          await Event.findOneAndUpdate({ id: dto.id }, dto, {
            upsert: true,
          });
        });

        session.endSession();
      }
    }
  } catch (e) {
    console.error("Soccer", e.message);
  }
};
