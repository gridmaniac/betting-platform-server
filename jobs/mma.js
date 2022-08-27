const SportRadar = require("../modules/sportradar");
const MMASeasonMapper = require("../mappers/MMASeasonMapper");
const MMAEventMapper = require("../mappers/MMAEventMapper");
const Event = require("../models/event");
const Season = require("../models/season");
const Setting = require("../models/setting");
const moment = require("moment");

module.exports.runJob = async function () {
  try {
    const apiKey = await Setting.findOne({ name: "SPORTRADAR_MMA_API_KEY" });
    if (!apiKey) throw new Error("SPORTRADAR_MMA_API_KEY is missing.");

    const apiUrl = await Setting.findOne({ name: "SPORTRADAR_MMA_API_URL" });
    if (!apiUrl) throw new Error("SPORTRADAR_MMA_API_URL is missing.");
    const radar = new SportRadar(apiUrl.value, apiKey.value);

    const minDate = moment().subtract(1, "month");
    const seasons = await radar.getSeasons();
    const filteredSeasons = seasons.filter((x) =>
      moment(x["start_date"]).isAfter(minDate)
    );

    for (const season of filteredSeasons) {
      const { dto } = new MMASeasonMapper(season);
      await Season.findOneAndUpdate({ id: dto.id }, dto, {
        upsert: true,
      });

      const summaries = await radar.getSeasonSummaries(dto.id);
      for (const record of summaries) {
        const { dto } = new MMAEventMapper(record);
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
    console.error("MMA", e.message);
  }
};
