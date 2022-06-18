const moment = require("moment");

class EventMapper {
  constructor(event) {
    this.event = event["sport_event"];
    this.context = this.event["sport_event_context"];
    this.status = event["sport_event_status"];

    this.dto = {
      id: this.event.id,
      seasonId: this.context["season"].id,
      startTime: moment.utc(this.event["start_time"]),
      startTimeConfirmed: this.event["start_time_confirmed"],
      competitors: this.event["competitors"],
      status: this.status["status"],
      winnerId: this.status["winner_id"],
      homeScore: this.status["home_score"],
      awayScore: this.status["away_score"],
    };
  }
}

module.exports = EventMapper;
