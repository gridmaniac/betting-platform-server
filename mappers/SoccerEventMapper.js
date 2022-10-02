const EventMapper = require("./EventMapper");
const moment = require("moment");

class SoccerEventMapper extends EventMapper {
  constructor(event) {
    super(event);

    this.dto.closeTime = moment
      .utc(this.event["start_time"])
      .subtract(2, "hours");

    if (this.status["match_tie"] === true) this.dto.draw = true;
  }
}

module.exports = SoccerEventMapper;
