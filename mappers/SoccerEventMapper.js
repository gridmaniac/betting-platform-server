const EventMapper = require("./EventMapper");

class SoccerEventMapper extends EventMapper {
  constructor(event) {
    super(event);

    this.homeScore = this.status["winner"] === "home_team" ? 1 : 0;
    this.awayScore = this.status["winner"] === "away_team" ? 1 : 0;
  }
}

module.exports = SoccerEventMapper;
