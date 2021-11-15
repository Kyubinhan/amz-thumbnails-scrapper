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
      // Click individual thumbnails first to load main images in the page
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
        const pos = srcArray.length - 1;
        const filename = srcArray[pos];

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

module.exports = {
  extractImageSources,
  saveImagesFromUrl,
};
