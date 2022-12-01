const Event = require("../models/event");
const Season = require("../models/season");

require("./db-with-cert");

const axios = require("axios");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

async function delay(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function crawlImages() {
  const seasons = await Season.find({ sport: "nba" });
  for (const season of seasons) {
    const events = await Event.find({ seasonId: season.id });
    for (const event of events)
      for (const competitor of event.competitors) {
        const imgPath = path.resolve(
          __dirname,
          "../assets/nba-highres",
          `${competitor.name}.png`
        );

        console.log("process", competitor.name);
        if (!fs.existsSync(imgPath)) {
          await delay(getRandomInt(3000, 6000));
          await crawlImage(competitor.name);
        }
      }
  }

  console.log("done");
}

// crawlImages();

async function crawlImage(name) {
  const alias = name;
  const { data } = await axios.get(
    `https://site.web.api.espn.com/apis/search/v2?region=us&lang=en&limit=10&page=1&iapPackages=ESPN_PLUS%2CESPN_PLUS_MLB&dtciVideoSearch=true&query=${alias}`
  );

  const imageUrl = data.results?.find((x) => x.type === "team")?.contents[0]
    ?.image?.default;

  if (imageUrl) await downloadImage(imageUrl, name);
}

async function downloadImage(url, name) {
  const imgPath = path.resolve(
    __dirname,
    "../assets/nba-highres",
    `${name}.png`
  );

  const writer = fs.createWriteStream(imgPath);

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function generateThumbnails() {
  const directory = path.resolve(__dirname, "../assets/nba-highres");
  fs.readdirSync(directory).forEach(async (file) => {
    const imgPath = path.resolve(__dirname, "../assets/nba-highres", file);
    const targetImgPath = path.resolve(
      __dirname,
      "../assets/nba",
      file.split(".png")[0]
    );

    await sharp(imgPath)
      .resize({ width: 200 })
      .webp({ quality: 40 })
      .toFile(targetImgPath + ".webp");
  });
}

generateThumbnails();
