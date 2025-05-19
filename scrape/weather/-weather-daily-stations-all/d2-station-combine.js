const fs = require('fs');
const path = require('path');
const { parse } = require('json2csv');

// === CONFIG ===
const inputDir = './data/station-json-formatted';       // Change this to your input directory
const outputDir = './data/station-combined';     // Change this to your output directory

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Read all JSON files from input directory
const files = fs.readdirSync(inputDir).filter(file => path.extname(file) === '.json');

// Combine all JSON content
let combinedData = [];

files.forEach(file => {
  const filePath = path.join(inputDir, file);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  try {
    const jsonData = JSON.parse(fileContent);

    // If the data is an array, concatenate it, otherwise push it
    if (Array.isArray(jsonData)) {
      combinedData = combinedData.concat(jsonData);
    } else {
      combinedData.push(jsonData);
    }
  } catch (err) {
    console.error(`Error parsing ${file}:`, err.message);
  }
});

// Save combined JSON
const jsonOutputPath = path.join(outputDir, 'combined.json');
fs.writeFileSync(jsonOutputPath, JSON.stringify(combinedData, null, 2), 'utf-8');

// Convert to CSV and save
try {
  const csv = parse(combinedData);
  const csvOutputPath = path.join(outputDir, 'combined.csv');
  fs.writeFileSync(csvOutputPath, csv, 'utf-8');
  console.log('Files written to', outputDir);
} catch (err) {
  console.error('Error converting to CSV:', err.message);
}
