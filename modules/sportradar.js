const axios = require("axios");

async function delay(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

class SportRadar {
  constructor(baseURL, apiKey) {
    this.api = axios.create({
      baseURL,
      params: { api_key: apiKey },
    });
  }

  async getSeasons() {
    const { data } = await this.api.get("seasons.json");
    await delay(1000);
    return data.seasons;
  }

  async getSeasonsWithLocale(locale) {
    const { data } = await this.api.get(`${locale}/seasons.json`);
    await delay(1000);
    return data.seasons;
  }

  async getSeasonSummaries(seasonId) {
    const { data } = await this.api.get(`seasons/${seasonId}/summaries.json`);
    await delay(1000);
    return data.summaries;
  }

  async getSeasonSummariesWithLocale(seasonId, locale, offset = 0) {
    const { data } = await this.api.get(
      `${locale}/seasons/${seasonId}/summaries.json`,
      {
        params: { offset },
      }
    );
    await delay(1000);
    return data.summaries;
  }
}

module.exports = SportRadar;
