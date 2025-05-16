const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { parse } = require('csv-parse/sync');

const jsonDir = './data/station-json-formatted';
const csvDir = './data/main-csvdate';
const outputDir = './data/reports';
const outputTextFile = path.join(outputDir, 'summary.txt');
const outputJsonFile = path.join(outputDir, 'summary.json');
const stationDataPath = path.join(outputDir, 'stations.json');

// Reference point
const refLat = 34.0725;
const refLng = -118.5425;

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Load station metadata
let stationMap = [];
if (fs.existsSync(stationDataPath)) {
  stationMap = JSON.parse(fs.readFileSync(stationDataPath, 'utf-8'));
} else {
  console.warn(`Warning: ${stationDataPath} not found.`);
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

let allOutput = '';
let summaryJson = [];

function processRecords(records, fileName, fileType) {
  if (!Array.isArray(records) || records.length === 0) return;

  const stationCode = records[0].Station;
  const stationInfo = stationMap.find(s => s.StationCode === stationCode);

  let maxWindSpeed = -Infinity;
  let maxWindSpeedTime = '';
  let maxWindGust = -Infinity;
  let maxWindGustTime = '';

  records.forEach(entry => {
    const speed = parseFloat(entry['Wind Speed High']);
    const gust = parseFloat(entry['Wind Gust High']);

    if (speed > maxWindSpeed) {
      maxWindSpeed = speed;
      maxWindSpeedTime = entry.DateTime;
    }

    if (gust > maxWindGust) {
      maxWindGust = gust;
      maxWindGustTime = entry.DateTime;
    }
  });

  const displayWindSpeedTime = moment(maxWindSpeedTime).format('MMM D, YYYY h:mm A');
  const displayWindGustTime = moment(maxWindGustTime).format('MMM D, YYYY h:mm A');

  let outputText = 
`Station Code: ${stationCode}
Max Wind Speed High: ${maxWindSpeed} mph at ${displayWindSpeedTime}
Max Wind Gust High: ${maxWindGust} mph at ${displayWindGustTime}
`;

  const record = {
    stationCode,
    maxWindSpeedHigh: maxWindSpeed,
    maxWindSpeedTime: maxWindSpeedTime,
    maxWindGustHigh: maxWindGust,
    maxWindGustTime: maxWindGustTime
  };

  if (stationInfo) {
    const distanceKm = haversineDistance(refLat, refLng, stationInfo.Lat, stationInfo.Lng);
    const distanceMiles = distanceKm * 0.621371;

    outputText += 
`Station Name: ${stationInfo.StationName}
Address: ${stationInfo.StationFullAddress || stationInfo.StationAddress || 'N/A'}
Zip Code: ${stationInfo.ZipCode || 'N/A'}
Latitude: ${stationInfo.Lat}
Longitude: ${stationInfo.Lng}
Distance from reference point: ${distanceMiles.toFixed(2)} miles
`;

    Object.assign(record, {
      stationName: stationInfo.StationName,
      stationAddress: stationInfo.StationFullAddress || stationInfo.StationAddress || null,
      zipCode: stationInfo.ZipCode || null,
      latitude: stationInfo.Lat,
      longitude: stationInfo.Lng,
      distanceMiles: parseFloat(distanceMiles.toFixed(2))
    });

  } else {
    outputText += 'Station metadata not found.\n';
  }

  allOutput += outputText + '\n---\n\n';
  summaryJson.push(record);
}

// Process JSON files
fs.readdirSync(jsonDir)
  .filter(file => file.endsWith('.json'))
  .forEach(file => {
    const filePath = path.join(jsonDir, file);
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const records = JSON.parse(rawData);
    processRecords(records, file, 'JSON');
  });

// Process CSV files
fs.readdirSync(csvDir)
  .filter(file => file.endsWith('.csv'))
  .forEach(file => {
    const filePath = path.join(csvDir, file);
    const csvData = fs.readFileSync(filePath, 'utf-8');
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true
    });
    processRecords(records, file, 'CSV');
  });

// Write output files
fs.writeFileSync(outputTextFile, allOutput.trim(), 'utf-8');
fs.writeFileSync(outputJsonFile, JSON.stringify(summaryJson, null, 2), 'utf-8');

console.log(`Summary written to ${outputTextFile}`);
console.log(`JSON data written to ${outputJsonFile}`);
