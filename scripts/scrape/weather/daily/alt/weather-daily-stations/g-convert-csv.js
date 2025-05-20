const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');

// Define paths
const inputDir = path.join(__dirname, 'data/json-merged');
const outputDir = path.join(__dirname, 'data/combined');
const outputJsonPath = path.join(outputDir, 'combined.json');
const outputCsvPath = path.join(outputDir, 'combined.csv');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const combinedArray = [];

fs.readdirSync(inputDir).forEach((file) => {
  if (path.extname(file) === '.json') {
    const filePath = path.join(inputDir, file);
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(rawData);

    // Each key is a date; each value is an object with station data
    for (const [date, values] of Object.entries(data)) {
      //console.log(date);
      combinedArray.push({ date, ...values });
    }
  }
});

// Write JSON output
fs.writeFileSync(outputJsonPath, JSON.stringify(combinedArray), 'utf-8');
console.log(`✅ Saved JSON to: ${outputJsonPath}`);

// Write CSV output
try {
  const parser = new Parser();
  const csv = parser.parse(combinedArray);
  fs.writeFileSync(outputCsvPath, csv, 'utf-8');
  console.log(`✅ Saved CSV to: ${outputCsvPath}`);
} catch (err) {
  console.error('❌ Failed to generate CSV:', err.message);
}
