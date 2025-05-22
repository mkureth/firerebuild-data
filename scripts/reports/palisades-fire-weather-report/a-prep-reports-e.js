const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Parser } = require('json2csv');

const inputCsvPath = path.resolve(__dirname, '../../../data/PROCESSED/fire/fire-ca-gov/combined.csv');
const outputJsonPath = path.resolve(__dirname, '../../../deploy/content/palisades-fire-weather-report/reports/cal-fire-reports/files/cal-fire-reports.json');
const outputCsvPath = path.resolve(__dirname, '../../../deploy/content/palisades-fire-weather-report/reports/cal-fire-reports/files/cal-fire-reports.csv');

// Fields to extract
const desiredFields = [
  'guid',
  'Size',
  'Containment',
  'DateTime',
  'Structures Threatened',
  'Structures Destroyed',
  'Civilian Injuries',
  'Civilian Fatalities',
  'Structures Damaged',
  'Firefighter Injuries'
];

const results = [];

// Read CSV
fs.createReadStream(inputCsvPath)
  .pipe(csv())
  .on('data', (row) => {
    const filtered = {};
    for (const field of desiredFields) {
      filtered[field] = row[field] || '';
    }
    results.push(filtered);
  })
  .on('end', () => {
    // Write JSON
    fs.writeFileSync(outputJsonPath, JSON.stringify(results, null, 2), 'utf8');
    console.log(`JSON written to ${outputJsonPath}`);

    // Write CSV
    const json2csvParser = new Parser({ fields: desiredFields });
    const csvData = json2csvParser.parse(results);
    fs.writeFileSync(outputCsvPath, csvData, 'utf8');
    console.log(`CSV written to ${outputCsvPath}`);
  });
