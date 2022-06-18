const axios = require("axios");

async function delay(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

class SportRadar {
  constructor(baseURL, api_key) {
    this.api = axios.create({
      baseURL,
      params: { api_key },
    });
  }

  async getSeasons() {
    const { data } = await this.api.get("seasons.json");
    await delay(1000);
    return data.seasons;
  }

  async getSeasonSummaries(seasonId) {
    const { data } = await this.api.get(`seasons/${seasonId}/summaries.json`);
    await delay(1000);
    return data.summaries;
  }
}

module.exports = SportRadar;
