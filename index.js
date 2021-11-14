// Inspired by https://dev.to/microworlds/image-downloader-with-puppeteer-and-the-fetch-api-5b8e

const fetch = require("node-fetch");
const fs = require("fs");
const puppeteer = require("puppeteer");
const path = require("path");

// Extract all imageLinks from the page
async function extractImageLinks(pageURL) {
  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();

    // Navigate to the page URL and ensure that we wait for the for the network request to complete
    await page.goto(pageURL, { waitUntil: "networkidle0" });
    // Wait for the html body tag to render
    await page.waitForSelector("body");

    const imageBank = await page.evaluate(() => {
      // Select the container of the thumbnail images
      const altImagesContainer = document.querySelector("#altImages");
      // Then select individual images and convert them into an array
      const imageTags = Array.from(
        altImagesContainer.querySelectorAll("li.imageThumbnail img")
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

function getDirectory() {
  const directory = process.argv[3] || `${path.dirname(__filename)}/images`;
  checkDirectory(directory);

  return directory;
}

async function saveImageToDisk(url, filename, directory) {
  const res = await fetch(url);
  const dest = fs.createWriteStream(`${directory}/${filename}`);

  res.body.pipe(dest);
}

(async function () {
  try {
    // Get the page url from the user
    const pageURL = process.argv[2];
    if (!pageURL) {
      throw new Error("Please provide the page url!");
    }

    console.log("Running the script...");

    const result = await extractImageLinks(pageURL);

    const directory = getDirectory();

    // Download all the images in parallel
    await Promise.all(
      result.map(({ src, filename }) =>
        saveImageToDisk(src, filename, directory)
      )
    );

    console.log("Images have been downloaded successfully!");
    console.log(`Check directory: ${directory}`);
  } catch (error) {
    console.log(error.message);
  }
})();
