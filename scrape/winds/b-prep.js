const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');

const inputCsvPath = './data/raw/winds.csv';
const outputCsvPath = './data/prep/prep.csv';
const outputJsonPath = './data/prep/prep.json';

const results = [];

const exclude = ['dew_point_max', 'dew_point_avg', 'dew_point_min', 'humidity_max', 'humidity_avg', 'humidity_min', 'pressure_max', 'pressure_avg', 'pressure_min', 'total_precipitation_inches'];

// Function to format each row (customize this as needed)
function formatRow(row) {
  const formattedRow = {};
  for (const key in row) {
    if (row.hasOwnProperty(key)) {
      const newKey = key.trim().toLowerCase().replace(/\s+/g, '_');
      const value = typeof row[key] === 'string' ? row[key].trim() : row[key];
      const exists = exclude.includes(newKey);
      if (!exists) {
        formattedRow[newKey] = value;
      }
    }
  }
  return formattedRow;
}

// Read and format the CSV
fs.createReadStream(inputCsvPath)
  .pipe(csv())
  .on('data', (row) => {
    const formatted = formatRow(row);
    results.push(formatted);
  })
  .on('end', () => {
    console.log('CSV file successfully processed.');

    // Write JSON output
    fs.writeFileSync(outputJsonPath, JSON.stringify(results, null, 2));
    console.log(`JSON saved to ${outputJsonPath}`);

    // Prepare CSV headers dynamically
    const headers = Object.keys(results[0]).map((header) => ({
      id: header,
      title: header,
    }));

    // Write cleaned CSV
    const csvWriter = createObjectCsvWriter({
      path: outputCsvPath,
      header: headers,
    });

    csvWriter
      .writeRecords(results)
      .then(() => console.log(`CSV saved to ${outputCsvPath}`));
  });
