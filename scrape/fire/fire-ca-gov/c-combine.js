const fs = require("fs");
const path = require("path");
const { parse } = require("json2csv");

// Directories
const inputDir = path.join(__dirname, "data/json");
const outputDir = path.join(__dirname, "data/combined");

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function readJsonFiles(directory) {
  let combinedData = [];

  // Read all files in the directory
  const files = fs.readdirSync(directory);
  files.forEach((file) => {
    const filePath = path.join(directory, file);

    // Only process .json files
    if (path.extname(file) === ".json") {
      try {
        const content = fs.readFileSync(filePath, "utf8");
        const jsonData = JSON.parse(content);

        // Ensure it's an array and merge
        if (Array.isArray(jsonData)) {
          combinedData = combinedData.concat(jsonData);
        } else {
          combinedData.push(jsonData);
        }
      } catch (error) {
        console.error(`Error reading ${file}:`, error);
      }
    }
  });

  return combinedData;
}

function saveJson(data) {
  const outputPath = path.join(outputDir, "combined.json");
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), "utf8");
  console.log("✅ JSON file saved:", outputPath);
}

function saveCsv(data) {
  try {
    const csv = parse(data);
    const outputPath = path.join(outputDir, "combined.csv");
    fs.writeFileSync(outputPath, csv, "utf8");
    console.log("✅ CSV file saved:", outputPath);
  } catch (error) {
    console.error("❌ Error converting to CSV:", error);
  }
}

// Main function
function main() {
  const combinedData = readJsonFiles(inputDir);
  saveJson(combinedData);
  saveCsv(combinedData);
}

main();
