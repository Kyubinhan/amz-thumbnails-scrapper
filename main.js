const path = require("path");
const fs = require("fs").promises;

const { extractMainImagesFromAMZ, saveImagesFromUrl } = require("./utils.js");

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
    if (idx === 0) return;
    if (!row) return;

    parsed.push(row.split(","));
  });

  return parsed;
}

function getArgs() {
  let filepath = `${path.dirname(__filename)}/data.csv`;
  let baseDirectory = `${path.dirname(__filename)}/images`;

  const args = process.argv.slice(2);
  args.map((arg) => {
    const [key, value] = arg.split("=");
    if (key === "--csv") {
      filepath = value;
    } else if (key === "--directory") {
      baseDirectory = value;
    } else if (key === "--help") {
      throw new Error(helpMessage);
    }
  });

  return { filepath, baseDirectory };
}

(async function () {
  try {
    const { filepath, baseDirectory } = getArgs();

    console.log("Running the script...");

    const data = await readCSVfile(filepath);

    console.log("Start downloading images...");

    for (const row of data) {
      const [foldername, pageURL] = row;

      try {
        const result = await extractMainImagesFromAMZ(pageURL);
        await saveImagesFromUrl(result, baseDirectory, foldername);
        console.log(`--Completed folder #${foldername} `);
      } catch (error) {
        console.log(`--Failed to process folder #${foldername}`);
      }
    }

    console.log("Images have been downloaded successfully!");
    console.log(`Check directory: ${baseDirectory}`);
  } catch (error) {
    console.log(error.message);
  }
})();
