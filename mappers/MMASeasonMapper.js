const SeasonMapper = require("./SeasonMapper");

class MMASeasonMapper extends SeasonMapper {
  constructor(season) {
    super(season);
    this.dto.sport = "mma";
  }
}

module.exports = MMASeasonMapper;
