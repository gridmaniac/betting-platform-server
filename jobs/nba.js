const SportRadar = require("../modules/sportradar");
const NBASeasonMapper = require("../mappers/NBASeasonMapper");
const NBAEventMapper = require("../mappers/NBAEventMapper");
const Event = require("../models/event");
const Season = require("../models/season");
const Setting = require("../models/setting");
const moment = require("moment");

module.exports.runJob = async function () {
  try {
    const apiKey = await Setting.findOne({ name: "SPORTRADAR_NBA_API_KEY" });
    if (!apiKey) throw new Error("SPORTRADAR_NBA_KEY is missing.");

    const apiUrl = await Setting.findOne({ name: "SPORTRADAR_NBA_API_URL" });
    if (!apiUrl) throw new Error("SPORTRADAR_NBA_API_URL is missing.");
    const radar = new SportRadar(apiUrl.value, apiKey.value);

    const minDate = moment().subtract(1, "day");
    const seasons = await radar.getSeasonsWithLocale("en");
    const nbaCompetitions = await Setting.findOne({
      name: "NBA_COMPETITIONS",
    });

    const competitions = nbaCompetitions?.value?.split(",") || [];
    const filteredSeasons = seasons.filter((x) => {
      return (
        competitions.indexOf(x["competition_id"]) !== -1 &&
        moment(x["end_date"]).isAfter(minDate)
      );
    });

    for (const season of filteredSeasons) {
      const { dto } = new NBASeasonMapper(season);
      await Season.findOneAndUpdate({ id: dto.id }, dto, {
        upsert: true,
      });

      let offset = 0;
      while (true) {
        const summaries = await radar.getSeasonSummariesWithLocale(
          dto.id,
          "en",
          offset
        );

        for (const record of summaries) {
          const { dto } = new NBAEventMapper(record);
          const session = await Event.startSession();
          await session.withTransaction(async () => {
            await Event.findOneAndUpdate({ id: dto.id }, dto, {
              upsert: true,
            });
          });

          session.endSession();
        }

        if (summaries.length < 200) break;
        offset += 200;
      }
    }
  } catch (e) {
    console.error("NBA", e.message);
  }
};
