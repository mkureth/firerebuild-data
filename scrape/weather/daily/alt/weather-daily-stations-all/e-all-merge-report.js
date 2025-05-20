const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const file1Path = path.join(__dirname, 'data/main-combined/combined.csv');
const file2Path = path.join(__dirname, 'data/station-combined/combined.csv');
const outputCsvPath = path.join(__dirname, 'data/all-merged/final-combined-report.csv');
const outputJsonPath = path.join(__dirname, 'data/all-merged/final-combined-report.json');

const excludedStations = ['KCATOPAN8'];
const excludedColumns = new Set([
  'Temperature Low',
  'Station Temperature Low',
  'Wind Speed Low',
  'Station Wind Speed Low',
  'Wind Gust Low',
  'Station Wind Gust Low',
  'Temperature High',
  'Station Temperature High'
]);

// Ensure the output directory exists
const outputDir = path.dirname(outputCsvPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.readFile(file1Path, 'utf8', (err, data1) => {
  if (err) {
    console.error(`Error reading file ${file1Path}:`, err);
    return;
  }

  fs.readFile(file2Path, 'utf8', (err, data2) => {
    if (err) {
      console.error(`Error reading file ${file2Path}:`, err);
      return;
    }

    const rows1 = Papa.parse(data1, { header: true }).data;
    const rows2 = Papa.parse(data2, { header: true }).data;

    const combined = [...rows1, ...rows2].filter(r => {
      return r.DateTime && r.Station && !excludedStations.includes(r.Station.trim());
    });

    combined.sort((a, b) => new Date(a.DateTime) - new Date(b.DateTime));

    const grouped = new Map();
    combined.forEach(row => {
      const dt = row.DateTime;
      if (!grouped.has(dt)) grouped.set(dt, []);
      grouped.get(dt).push(row);
    });

    const resultRows = [];

    grouped.forEach((rows, dateTime) => {
      const result = { DateTime: dateTime };

      const getExtreme = (key, isMax = true) => {
        let selected = null;
        for (const row of rows) {
          const val = parseFloat(row[key]);
          if (isNaN(val)) continue;
          if (
            selected === null ||
            (isMax ? val > selected.val : val < selected.val)
          ) {
            selected = { val, station: row.Station };
          }
        }
        return selected;
      };

      const metrics = [
        ['Temperature High', true],
        ['Wind Speed High', true],
        ['Wind Gust High', true],
        ['Temperature Low', false],
        ['Wind Speed Low', false],
        ['Wind Gust Low', false]
      ];

      for (const [key, isMax] of metrics) {
        if (excludedColumns.has(key)) continue;
        const extreme = getExtreme(key, isMax);
        if (extreme) {
          result[key] = extreme.val;
          const stationKey = `Station ${key}`;
          if (!excludedColumns.has(stationKey)) {
            result[stationKey] = extreme.station;
          }
        }
      }

      resultRows.push(result);
    });

    // Final headers based on what's included
    const baseHeaders = ['DateTime'];

    const possibleMetrics = [
      'Temperature High',
      'Wind Speed High',
      'Wind Gust High',
      'Temperature Low',
      'Wind Speed Low',
      'Wind Gust Low'
    ];

    for (const metric of possibleMetrics) {
      if (!excludedColumns.has(metric)) {
        baseHeaders.push(metric);
      }
      const stationKey = `Station ${metric}`;
      if (!excludedColumns.has(stationKey)) {
        baseHeaders.push(stationKey);
      }
    }

    // Write CSV
    const csvOutput = Papa.unparse(resultRows, {
      columns: baseHeaders
    });

    fs.writeFile(outputCsvPath, csvOutput, 'utf8', err => {
      if (err) {
        console.error(`Error writing CSV to ${outputCsvPath}:`, err);
      } else {
        console.log(`CSV output written to ${outputCsvPath}`);
      }
    });

    // Write JSON
    fs.writeFile(outputJsonPath, JSON.stringify(resultRows, null, 2), 'utf8', err => {
      if (err) {
        console.error(`Error writing JSON to ${outputJsonPath}:`, err);
      } else {
        console.log(`JSON output written to ${outputJsonPath}`);
      }
    });

    // Summary
    console.log(`Excluded stations: ${excludedStations.join(', ')}`);
    console.log(`Excluded columns: ${Array.from(excludedColumns).join(', ')}`);
  });
});
