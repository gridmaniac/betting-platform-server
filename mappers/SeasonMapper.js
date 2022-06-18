const moment = require("moment");

class SeasonMapper {
  constructor(season) {
    this.dto = {
      id: season.id,
      competitionId: season["competition_id"],
      name: season.name,
      startDate: moment.utc(season["start_date"]),
      endDate: moment.utc(season["end_date"]),
    };
  }
}

module.exports = SeasonMapper;
