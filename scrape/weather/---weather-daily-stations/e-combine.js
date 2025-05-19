const fs = require('fs');
const path = require('path');

// Input directories
const inputDirs = [
  './data/json-formatted/KCAMALIB62',
  './data/json-formatted/KCAMALIB87',
  './data/json-formatted/KCAMALIB133',
  './data/json-formatted/KCAPACIF132',
  './data/json-formatted/KCAPACIF208',
  './data/json-formatted/KCAPACIF227',
  './data/json-formatted/KCAPACIF287',
  './data/json-formatted/KCAPACIF320',
  './data/json-formatted/KCALOSAN958'
];

// Output directory
const outputDir = './data/json-combined';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Helper to read JSON file
function readJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading/parsing ${filePath}:`, err.message);
    return null;
  }
}

// Collect all filenames
const allFilenames = new Set();

for (const dir of inputDirs) {
  if (!fs.existsSync(dir)) {
    console.warn(`Directory not found: ${dir}`);
    continue;
  }

  const files = fs.readdirSync(dir).filter(file => file.endsWith('.json'));
  files.forEach(file => allFilenames.add(file));
}

// Process and combine files
for (const filename of allFilenames) {
  let combined = [];

  for (const dir of inputDirs) {
    const filePath = path.join(dir, filename);
    if (fs.existsSync(filePath)) {
      const data = readJSON(filePath);
      if (Array.isArray(data)) {
        combined = combined.concat(data);
      } else if (data) {
        combined.push(data);
      }
    }
  }

  // Write combined data to output
  const outputPath = path.join(outputDir, filename);
  try {
    fs.writeFileSync(outputPath, JSON.stringify(combined));
    console.log(`Combined file written: ${outputPath}`);
  } catch (err) {
    console.error(`Error writing to ${outputPath}:`, err.message);
  }
}
