const fs = require('fs');
const path = require('path');

// File paths
const stationFilePath = path.join(__dirname, './data/stations/combined.json');
const kcatopanFilePath = path.join(__dirname, './data/KCATOPAN8/combined.json');
const outputJsonPath = path.join(__dirname, './data/output/highest_stations.json');
const outputCsvPath = path.join(__dirname, './data/output/highest_stations.csv');

// Load and parse station data
const stationData = JSON.parse(fs.readFileSync(stationFilePath, 'utf-8'));

// Load and parse KCATOPAN8 data
const kcatopanData = JSON.parse(fs.readFileSync(kcatopanFilePath, 'utf-8'));

// Convert KCATOPAN8 data into a map for quick lookup by date
const kcatopanMap = {};
kcatopanData.forEach(entry => {
  const date = new Date(entry['DateTime']).toISOString().split('T')[0];
  kcatopanMap[date] = {
    windSpeedHigh: entry['Wind Speed High'],
    windGustHigh: entry['Wind Gust High']
  };
});

// Sort the station data by date
stationData.sort((a, b) => new Date(a.date) - new Date(b.date));

// Station base keys
const stationKeys = [
  'KCAMALIB62', 'KCAPACIF132', 'KCAMALIB87', 'KCAPACIF208',
  'KCALOSAN958', 'KCAPACIF227', 'KCAPACIF287', 'KCAMALIB133', 'KCAPACIF320'
];

// Process and merge results
const result = stationData.map(entry => {
  let maxSpeed = -Infinity;
  let maxGust = -Infinity;
  let stationSpeed = '';
  let stationGust = '';

  stationKeys.forEach(station => {
    const speed = entry[`${station}_s`];
    const gust = entry[`${station}_g`];

    if (speed != null && speed > maxSpeed) {
      maxSpeed = speed;
      stationSpeed = station;
    }

    if (gust != null && gust > maxGust) {
      maxGust = gust;
      stationGust = station;
    }
  });

  const dateOnly = new Date(entry.date).toISOString().split('T')[0];
  const comparison = kcatopanMap[dateOnly] || {};

  const windSpeedHigh = comparison.windSpeedHigh ?? null;
  const windGustHigh = comparison.windGustHigh ?? null;

  return {
    date: entry.date,
    Speed: maxSpeed,
    Station_Speed: stationSpeed,
    Gust: maxGust,
    Station_Gust: stationGust,
    Compared_Speed: windSpeedHigh != null ? Number(windSpeedHigh - maxSpeed).toFixed(2)  : null,
    Compared_Gust: windGustHigh != null ? Number(windGustHigh - maxGust).toFixed(2) : null
  };
});

// Ensure output directory exists
fs.mkdirSync(path.dirname(outputJsonPath), { recursive: true });

// Write JSON output
fs.writeFileSync(outputJsonPath, JSON.stringify(result, null, 2), 'utf-8');

// Convert to CSV
const csvHeader = [
  'date', 'Speed', 'Station_Speed', 'Gust', 'Station_Gust', 'Compared_Speed', 'Compared_Gust'
].join(',');

const csvRows = result.map(r =>
  [
    r.date,
    r.Speed,
    r.Station_Speed,
    r.Gust,
    r.Station_Gust,
    r.Compared_Speed,
    r.Compared_Gust
  ].join(',')
);

const csvData = [csvHeader, ...csvRows].join('\n');

// Write CSV output
fs.writeFileSync(outputCsvPath, csvData, 'utf-8');

console.log(`Files saved to:\n- ${outputJsonPath}\n- ${outputCsvPath}`);
