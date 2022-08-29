const EventMapper = require("./EventMapper");
const moment = require("moment");

class NFLEventMapper extends EventMapper {
  constructor(event) {
    super(event);

    this.dto.homeScore = this.status["winner"] === "home_team" ? 1 : 0;
    this.dto.awayScore = this.status["winner"] === "away_team" ? 1 : 0;
    this.dto.closeTime = moment
      .utc(this.event["start_time"])
      .subtract(24, "hours");
  }
}

module.exports = NFLEventMapper;
