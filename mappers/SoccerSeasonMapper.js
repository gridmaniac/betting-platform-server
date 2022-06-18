const SeasonMapper = require("./SeasonMapper");

class SoccerSeasonMapper extends SeasonMapper {
  constructor(season) {
    super(season);
    this.dto.sport = "soccer";
  }
}

module.exports = SoccerSeasonMapper;
