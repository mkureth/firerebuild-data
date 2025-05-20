const fs = require("fs");
const path = require("path");
const { parse } = require("json2csv");

// Directories
const inputDir = path.join(__dirname, '../../data/SOURCE/fire/fire-ca-gov/json');
const outputDir = path.join(__dirname, '../../data/PROCESSED/fire/fire-ca-gov');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function convertToDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;

  const [month, day, year] = dateStr.split('/');
  let [time, meridian] = timeStr.split(' ');
  let [hour, minute] = time.split(':').map(Number);

  if (meridian.toUpperCase() === 'PM' && hour !== 12) hour += 12;
  if (meridian.toUpperCase() === 'AM' && hour === 12) hour = 0;

  const isoDate = `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  const isoTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  return `${isoDate}T${isoTime}`;
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

        const records = Array.isArray(jsonData) ? jsonData : [jsonData];

        // Transform each record
        const transformed = records.map(record => {
          if (record.Date && record.Time) {
            const dateTime = convertToDateTime(record.Date, record.Time);
            if (dateTime) {
              record.DateTime = dateTime;
              delete record.Date;
              delete record.Time;
            }
          }
          return record;
        });

        combinedData = combinedData.concat(transformed);
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
