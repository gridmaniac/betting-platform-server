const EventMapper = require("./EventMapper");
const moment = require("moment");

class NCAAEventMapper extends EventMapper {
  constructor(event) {
    super(event);

    this.dto.closeTime = moment
      .utc(this.event["start_time"])
      .subtract(2, "hours");
  }
}

module.exports = NCAAEventMapper;
