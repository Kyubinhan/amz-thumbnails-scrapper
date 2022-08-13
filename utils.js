// Inspired by https://dev.to/microworlds/image-downloader-with-puppeteer-and-the-fetch-api-5b8e

const fetch = require("node-fetch");
const fs = require("fs");
const puppeteer = require("puppeteer");

async function extractImageSources(pageURL) {
  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();

    // Navigate to the page URL and ensure that we wait for the network request to complete
    await page.goto(pageURL, { waitUntil: "networkidle0" });
    // Wait for all the thumbnail images to be loaded
    await page.waitForSelector("#altImages");

    const imageBank = await page.evaluate(() => {
      // Grab the thumbnail images container
      const altImagesContainer = document.querySelector("#altImages");
      // Click through individual thumbnails to load their higher res images in the page
      const thumbnailImages = altImagesContainer.querySelectorAll(
        "li.imageThumbnail img"
      );
      for (let ti of thumbnailImages) {
        ti.click();
      }

      // Then grab all the main images and convert them into an array
      const imageTags = Array.from(
        document.querySelectorAll("div.imgTagWrapper img")
      );

      const imageArray = [];

      imageTags.map((image) => {
        const src = image.src;

        const srcArray = src.split("/");
        const filename = srcArray[srcArray.length - 1];

        imageArray.push({
          src,
          filename,
        });
      });

      return imageArray;
    });

    return imageBank;
  } catch (error) {
    throw error;
  } finally {
    await browser.close();
  }
}

function checkDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true,
    });
  }
}

async function saveImageToDisk(url, filename, directory) {
  const res = await fetch(url);
  const dest = fs.createWriteStream(`${directory}/${filename}`);

  res.body.pipe(dest);
}

async function saveImagesFromUrl(result, baseDirectory, foldername) {
  const directory = `${baseDirectory}/${foldername}`;
  checkDirectory(directory);

  await Promise.all(
    result.map(({ src, filename }) => saveImageToDisk(src, filename, directory))
  );
}

async function readCSVfile(filepath) {
  console.log(`Reading CSV file: ${filepath}`);

  const data = await fs.promises.readFile(filepath, "utf8");
  const rows = data.split(/\r?\n|\r/); // match all possible newline representations

  const parsed = [];
  rows.forEach((row, idx) => {
    // Ignore the header or empty rows
    if (idx === 0 || !row) return;

    const splitted = row.split(",");
    // Each row must have 2 columns
    if (splitted.length !== 2) return;

    parsed.push(splitted);
  });

  return parsed;
}

module.exports = {
  extractImageSources,
  readCSVfile,
  saveImagesFromUrl,
};
