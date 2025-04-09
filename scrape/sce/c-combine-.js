const fs = require('fs');
const path = require('path');
const moment = require('moment');
const Papa = require('papaparse');

// File paths
const inputPath = path.join(__dirname, 'data/json/sce.json');
const outputJsonPath = path.join(__dirname, 'data/json/dates.json');
const outputCsvPath = path.join(__dirname, 'data/json/dates.csv');

// Load input JSON
const results = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

// Object to collect padded data by timestamp
const timelineMap = {};

results.forEach(entry => {
  const start = moment(entry.start).startOf('minute'); // Normalize to nearest minute
  const end = moment(entry.end).startOf('minute');

  const current = start.clone();

  while (current.diff(end, 'minutes') <= 0) {
    const timestamp = current.toISOString();

    if (!timelineMap[timestamp]) {
      timelineMap[timestamp] = { date: timestamp };
    }

    Object.keys(entry).forEach(key => {
      if (key !== 'start' && key !== 'end') {
        timelineMap[timestamp][key] = entry[key];
      }
    });

    current.add(15, 'minutes');
  }
});


// Convert map to array
const paddedData = Object.values(timelineMap);

// Save JSON
fs.writeFileSync(outputJsonPath, JSON.stringify(paddedData, null, 2), 'utf8');

// Save CSV
const csv = Papa.unparse(paddedData, { quotes: true });
fs.writeFileSync(outputCsvPath, csv, 'utf8');

console.log(`✅ Padded JSON saved to: ${outputJsonPath}`);
console.log(`✅ Padded CSV saved to: ${outputCsvPath}`);