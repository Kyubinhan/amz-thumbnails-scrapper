// Inspired by https://dev.to/microworlds/image-downloader-with-puppeteer-and-the-fetch-api-5b8e

const fs = require("fs").promises;
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

    const urls = await page.evaluate(() => {
      // Select the container of the thumbnail images
      const altImagesContainer = document.querySelector("#altImages");
      // Then select individual images and convert them into an array
      const imageTags = Array.from(
        altImagesContainer.querySelectorAll("li.imageThumbnail img")
      );

      return imageTags.map((image) => image.src);
    });

    return urls;
  } catch (error) {
    throw error;
  } finally {
    await browser.close();
  }
}

async function writeToCSV(pageURL, imageURLs, customDownloadPath) {
  const header = "Product,Images";
  const data = imageURLs.map((url, index) => {
    if (index === 0) {
      return `"${pageURL}","${url}"`;
    }

    return `,"${url}"`;
  });
  const rows = [header, ...data];

  const downloadPath =
    customDownloadPath || `${path.dirname(__filename)}/data.csv`;

  await fs.writeFile(downloadPath, rows.join("\n"));
  console.log("Image URLs have been stored in CSV file successfully!");
  console.log(`Path: ${downloadPath}`);
}

(async function () {
  try {
    // Get the page url from the user
    const pageURL = process.argv[2];
    if (!pageURL) {
      throw new Error("Please provide the page url!");
    }

    console.log("Running the script...");

    const imageURLs = await extractImageLinks(pageURL);

    const customDownloadPath = process.argv[3];
    await writeToCSV(pageURL, imageURLs, customDownloadPath);
  } catch (error) {
    console.log(error.message);
  }
})();
