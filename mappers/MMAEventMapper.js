const EventMapper = require("./EventMapper");

class MMAEventMapper extends EventMapper {
  constructor(event) {
    super(event);

    this.dto.competitors = this.dto.competitors.map((x) => {
      const names = x.name.split(", ");
      return { ...x, name: `${names[1]} ${names[0]}` };
    });
  }
}

module.exports = MMAEventMapper;
