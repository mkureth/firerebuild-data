const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// File paths
const inputCsvPath = path.resolve(__dirname, '../../../data/PROCESSED/weather/monthly/combined.csv');
const outputJsonPath = path.resolve(__dirname, '../../../deploy/content/palisades-fire-weather-report/reports/historic-wind-speeds/files/historic-wind-speeds.json');
const outputCsvPath = path.resolve(__dirname, '../../../deploy/content/palisades-fire-weather-report/reports/historic-wind-speeds/files/historic-wind-speeds.csv');

const filteredRows = [];

fs.createReadStream(inputCsvPath)
  .pipe(csv())
  .on('data', (row) => {
    const windSpeed = parseFloat(row['Wind Speed Max']);
    if (!isNaN(windSpeed) && windSpeed >= 28) {
      filteredRows.push(row); // Keep all original columns
    }
  })
  .on('end', () => {
    // Write JSON
    fs.writeFileSync(outputJsonPath, JSON.stringify(filteredRows, null, 2), 'utf8');

    // Write CSV
    if (filteredRows.length > 0) {
      const headers = Object.keys(filteredRows[0]);
      const csvHeader = headers.join(',') + '\n';
      const csvBody = filteredRows.map(row =>
        headers.map(field => `"${(row[field] ?? '').replace(/"/g, '""')}"`).join(',')
      ).join('\n');

      fs.writeFileSync(outputCsvPath, csvHeader + csvBody, 'utf8');
    }

    console.log('Filtered records saved:');
    console.log(`- JSON: ${outputJsonPath}`);
    console.log(`- CSV: ${outputCsvPath}`);
  })
  .on('error', (err) => {
    console.error('Error reading CSV:', err);
  });
