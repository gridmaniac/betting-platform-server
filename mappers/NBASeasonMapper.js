const SeasonMapper = require("./SeasonMapper");

class NBASeasonMapper extends SeasonMapper {
  constructor(season) {
    super(season);
    this.dto.sport = "nba";
  }
}

module.exports = NBASeasonMapper;
