const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Parser } = require('json2csv');

const inputFile = path.join(__dirname, 'data/all-merged/final-combined.csv');
const outputFile = path.join(__dirname, 'data/all-station-headers/combined.csv');

const rowsMap = new Map(); // Key: Date + Time, Value: merged row object

fs.createReadStream(inputFile)
  .pipe(csv())
  .on('data', (data) => {
    const date = data['Date']?.trim();
    const time = data['Time']?.trim();
    const station = data['Station']?.trim();

    if (!date || !time || !station) return;

    const key = `${date}_${time}`;
    if (!rowsMap.has(key)) {
      rowsMap.set(key, {
        Date: date,
        Time: time,
      });
    }

    const row = rowsMap.get(key);

    row[`${station}_Temperature`] = data['Temperature'];
    row[`${station}_Wind Speed`] = data['Wind Speed'];
    row[`${station}_Wind Gust`] = data['Wind Gust'];
  })
  .on('end', () => {
    const allRows = Array.from(rowsMap.values());

    // Collect all possible headers across rows
    const headersSet = new Set(['Date', 'Time']);
    allRows.forEach((row) => {
      Object.keys(row).forEach((key) => headersSet.add(key));
    });

    const headers = Array.from(headersSet);

    const parser = new Parser({ fields: headers });
    const csvData = parser.parse(allRows);

    fs.writeFileSync(outputFile, csvData);
    console.log(`CSV file with station headers saved to ${outputFile}`);
  });
