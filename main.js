const path = require("path");
const fs = require("fs").promises;

const { extractImageSources, saveImagesFromUrl } = require("./utils.js");

const helpMessage = `
  How to use this script

  * This will read data from ./data.csv and save images under /images
  node main.js

  * Use --csv to set your csv file path
  node main.js --csv=your/csv/file/path

  * Use --directory to set your base directory path for image download
  node main.js --directory=your/base/directory/
  
  * You can use --csv and --directory both like this
  node main.js --csv=your/csv/file/path --directory=your/base/directory/
`;

async function readCSVfile(filepath) {
  console.log(`Reading CSV file: ${filepath}`);

  const data = await fs.readFile(filepath, "utf8");
  const rows = data.split("\r\n");

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

function getArgs() {
  // Set default paths
  let csvFilePath = `${path.dirname(__filename)}/data.csv`;
  let imageBaseDirectory = `${path.dirname(__filename)}/images`;

  const args = process.argv.slice(2);
  args.map((arg) => {
    const [key, value] = arg.split("=");
    if (key === "--csv") {
      csvFilePath = value;
    } else if (key === "--directory") {
      imageBaseDirectory = value;
    } else if (key === "--help") {
      throw new Error(helpMessage);
    }
  });

  return { csvFilePath, imageBaseDirectory };
}

(async function () {
  try {
    const { csvFilePath, imageBaseDirectory } = getArgs();

    console.log("Running the script...");

    const data = await readCSVfile(csvFilePath);

    console.log("Start downloading images...");

    for (const row of data) {
      const [foldername, pageURL] = row;

      try {
        const result = await extractImageSources(pageURL);
        await saveImagesFromUrl(result, imageBaseDirectory, foldername);
        console.log(`--Completed folder #${foldername}`);
      } catch (error) {
        console.log(
          `--Failed to process folder #${foldername}: (${error.message})`
        );
      }
    }

    console.log("Images have been downloaded successfully!");
    console.log(`Check directory: ${imageBaseDirectory}`);
  } catch (error) {
    console.log(error.message);
  }
})();
