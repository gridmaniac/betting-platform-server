const SportRadar = require("../modules/sportradar");
const MMASeasonMapper = require("../mappers/MMASeasonMapper");
const MMAEventMapper = require("../mappers/MMAEventMapper");
const Event = require("../models/event");
const Season = require("../models/season");
const moment = require("moment");

module.exports.runJob = async function () {
  try {
    const mmaRadar = new SportRadar(
      "https://api.sportradar.com/mma/trial/v2/en",
      process.env.SPORTRADAR_MMA_API_KEY
    );

    const minDate = moment().subtract(1, "month");
    const seasons = await mmaRadar.getSeasons();
    const filteredSeasons = seasons.filter((x) =>
      moment(x["start_date"]).isAfter(minDate)
    );

    for (const season of filteredSeasons) {
      const { dto } = new MMASeasonMapper(season);
      await Season.findOneAndUpdate({ id: dto.id }, dto, {
        upsert: true,
      });

      const summaries = await mmaRadar.getSeasonSummaries(dto.id);
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
