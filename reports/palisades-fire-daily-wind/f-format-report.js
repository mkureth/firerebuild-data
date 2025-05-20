const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { parse } = require('csv-parse/sync');

const combinedCsvFile = '../../data/PROCESSED/weather/day/combined.csv';

const outputTextFile = '../../data/REPORTS/weather/palisades-fire-daily-wind/reports/summary.txt';
const outputJsonFile = '../../data/REPORTS/weather/palisades-fire-daily-wind/reports/summary.json';
const stationDataPath = '../../data/SOURCE/weather/stations/stations.json';

// Reference point
const refLat = 34.0725;
const refLng = -118.5425;

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

function processRecords(records) {
  if (!Array.isArray(records) || records.length === 0) return;

  // Group records by Station
  const groupedByStation = records.reduce((acc, record) => {
    const station = record.Station;
    if (!acc[station]) {
      acc[station] = [];
    }
    acc[station].push(record);
    return acc;
  }, {});

  for (const stationCode in groupedByStation) {
    const stationRecords = groupedByStation[stationCode];
    const stationInfo = stationMap.find(s => s.StationCode === stationCode);

    let maxWindSpeed = -Infinity;
    let maxWindSpeedTime = '';
    let maxWindGust = -Infinity;
    let maxWindGustTime = '';

    stationRecords.forEach(entry => {
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

    const displayWindSpeedTime = moment(maxWindSpeedTime).format('MMM D, h:mm A');
    const displayWindGustTime = moment(maxWindGustTime).format('MMM D, h:mm A');

    let outputText = `Station Code: ${stationCode}
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

      outputText += `Station Name: ${stationInfo.StationName}
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
}

// Process the combined CSV file
if (fs.existsSync(combinedCsvFile)) {
  const csvData = fs.readFileSync(combinedCsvFile, 'utf-8');
  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true
  });
  processRecords(records);
} else {
  console.error(`Error: Combined CSV file not found at ${combinedCsvFile}`);
}

// Write output files
fs.writeFileSync(outputTextFile, allOutput.trim(), 'utf-8');
fs.writeFileSync(outputJsonFile, JSON.stringify(summaryJson, null, 2), 'utf-8');

console.log(`Summary written to ${outputTextFile}`);
console.log(`JSON data written to ${outputJsonFile}`);