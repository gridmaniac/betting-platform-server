const SportRadar = require("../modules/sportradar");
const NFLSeasonMapper = require("../mappers/NFLSeasonMapper");
const NFLEventMapper = require("../mappers/NFLEventMapper");
const Event = require("../models/event");
const Season = require("../models/season");
const Setting = require("../models/setting");
const moment = require("moment");

module.exports.runJob = async function () {
  try {
    const apiKey = await Setting.findOne({ name: "SPORTRADAR_NFL_API_KEY" });
    if (!apiKey) throw new Error("SPORTRADAR_NFL_KEY is missing.");

    const apiUrl = await Setting.findOne({ name: "SPORTRADAR_NFL_API_URL" });
    if (!apiUrl) throw new Error("SPORTRADAR_NFL_API_URL is missing.");
    const radar = new SportRadar(apiUrl.value, apiKey.value);

    const minDate = moment().subtract(1, "day");
    const seasons = await radar.getSeasons();
    const nflCompetitions = await Setting.findOne({
      name: "NFL_COMPETITIONS",
    });

    const competitions = nflCompetitions?.value?.split(",") || [];
    const filteredSeasons = seasons.filter((x) => {
      return (
        competitions.indexOf(x["competition_id"]) !== -1 &&
        moment(x["end_date"]).isAfter(minDate)
      );
    });

    for (const season of filteredSeasons) {
      const { dto } = new NFLSeasonMapper(season);
      await Season.findOneAndUpdate({ id: dto.id }, dto, {
        upsert: true,
      });

      const summaries = await radar.getSeasonSummaries(dto.id);
      for (const record of summaries) {
        const { dto } = new NFLEventMapper(record);
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
    console.error("NFL", e.message);
  }
};
