const EventMapper = require("./EventMapper");
const moment = require("moment");

class MMAEventMapper extends EventMapper {
  constructor(event) {
    super(event);

    this.dto.competitors = this.dto.competitors.map((x) => {
      const names = x.name.split(", ");
      return { ...x, name: `${names[1]} ${names[0]}` };
    });

    this.dto.closeTime = moment
      .utc(this.event["start_time"])
      .subtract(2, "hours");

    if (this.status["winner"] === "draw") this.dto.draw = true;
  }
}

module.exports = MMAEventMapper;
