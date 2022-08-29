const SeasonMapper = require("./SeasonMapper");

class NFLSeasonMapper extends SeasonMapper {
  constructor(season) {
    super(season);
    this.dto.sport = "nfl";
  }
}

module.exports = NFLSeasonMapper;
