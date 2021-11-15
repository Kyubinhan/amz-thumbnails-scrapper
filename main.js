const path = require("path");
const fs = require("fs").promises;

const { extractMainImagesFromAMZ, saveImagesFromUrl } = require("./utils.js");

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

(async function () {
  try {
    console.log("Running the script...");

    const filepath = process.argv[2] || `${path.dirname(__filename)}/data.csv`;
    const data = await readCSVfile(filepath);

    const baseDirectory =
      process.argv[3] || `${path.dirname(__filename)}/images`;

    console.log("Start downloading images...");
    await Promise.all(
      data.map(async ([foldername, pageUrl]) => {
        const result = await extractMainImagesFromAMZ(pageUrl);
        await saveImagesFromUrl(result, baseDirectory, foldername);
      })
    );

    console.log("Images have been downloaded successfully!");
    console.log(`Check directory: ${baseDirectory}`);
  } catch (error) {
    console.log(error.message);
  }
})();
