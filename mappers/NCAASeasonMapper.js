const SeasonMapper = require("./SeasonMapper");

class NCAASeasonMapper extends SeasonMapper {
  constructor(season) {
    super(season);
    this.dto.sport = "ncaa";
  }
}

module.exports = NCAASeasonMapper;
