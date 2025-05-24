const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { parse } = require('csv-parse/sync');

const combinedCsvFile = '../../../data/PROCESSED/weather/day/combined.csv';
const stationDataPath = '../../../data/SOURCE/weather/stations/stations.json';

const perStationOutputDir = '../../../deploy/content/palisades-fire-weather-report/reports/highest-wind-speed-analysis/files/stations/';

const outputTextFile = '../../../deploy/content/palisades-fire-weather-report/reports/highest-wind-speed-analysis/files/summary.txt';
const outputJsonFile = '../../../deploy/content/palisades-fire-weather-report/reports/highest-wind-speed-analysis/files/summary.json';
const outputCsvFile = '../../../deploy/content/palisades-fire-weather-report/reports/highest-wind-speed-analysis/files/summary.csv';

const outputRangedTextFile = '../../../deploy/content/palisades-fire-weather-report/reports/wind-during-potential-containment/files/summary-ranged.txt';
const outputRangedJsonFile = '../../../deploy/content/palisades-fire-weather-report/reports/wind-during-potential-containment/files/summary-ranged.json';
const outputRangedCsvFile = '../../../deploy/content/palisades-fire-weather-report/reports/wind-during-potential-containment/files/summary-ranged.csv';

const fireLat = 34.07901;
const fireLng = -118.5591;
const kcatopanLat = 34.0837306;
const kcatopanLng = -118.5995221;
const klaxLat = 33.9416;
const klaxLng = -118.4085;

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
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toCsv(data) {
  if (!data.length) return '';
  const headers = Object.keys(data[0]);
  const lines = data.map(row => headers.map(h => (row[h] !== null && row[h] !== undefined ? `"${String(row[h]).replace(/"/g, '""')}"` : '')).join(','));
  return [headers.join(','), ...lines].join('\n');
}

let allOutput = '';
let summaryJson = [];

function processRecords(records) {
  if (!Array.isArray(records) || records.length === 0) return;

  const groupedByStation = records.reduce((acc, record) => {
    const station = record.Station;
    if (!acc[station]) acc[station] = [];
    acc[station].push(record);
    return acc;
  }, {});

  const excludedFromSummary = new Set([
    //'KCALOSAN842',
    //'KCASANTA4733',
    //'KCASANTA630',
    //'KCATOPAN8',
    //'KLAX'
  ]);

  const kcatopanData = groupedByStation['KCATOPAN8'] || [];
  const klaxData = groupedByStation['KLAX'] || [];

  const kcatopanByTime = {};
  kcatopanData.forEach(entry => {
    kcatopanByTime[entry.DateTime] = entry;
  });

  const klaxByTime = {};
  klaxData.forEach(entry => {
    klaxByTime[entry.DateTime] = entry;
  });

  if (!fs.existsSync(perStationOutputDir)) {
    fs.mkdirSync(perStationOutputDir, { recursive: true });
  }

  for (const stationCode in groupedByStation) {
    const stationRecords = groupedByStation[stationCode];
    const stationInfo = stationMap.find(s => s.StationCode === stationCode);

    const enrichedRecords = stationRecords.map(entry => {
      const lat = parseFloat(stationInfo?.Lat ?? 0);
      const lng = parseFloat(stationInfo?.Lng ?? 0);

      const fireDistKm = haversineDistance(lat, lng, fireLat, fireLng);
      const kcatopanDistKm = haversineDistance(lat, lng, kcatopanLat, kcatopanLng);
      const klaxDistKm = haversineDistance(lat, lng, klaxLat, klaxLng);

      let kcatopanWindSpeedDiff = '';
      let kcatopanWindGustDiff = '';
      let klaxWindSpeedDiff = '';
      let klaxWindGustDiff = '';

      if (stationCode !== 'KCATOPAN8' && kcatopanByTime[entry.DateTime]) {
        const kEntry = kcatopanByTime[entry.DateTime];
        const currentSpeed = parseFloat(entry['Wind Speed High']);
        const currentGust = parseFloat(entry['Wind Gust High']);
        const refSpeed = parseFloat(kEntry['Wind Speed High']);
        const refGust = parseFloat(kEntry['Wind Gust High']);

        kcatopanWindSpeedDiff = (currentSpeed - refSpeed).toFixed(2);
        kcatopanWindGustDiff = (currentGust - refGust).toFixed(2);
      }

      if (stationCode !== 'KLAX' && klaxByTime[entry.DateTime]) {
        const kEntry = klaxByTime[entry.DateTime];
        const currentSpeed = parseFloat(entry['Wind Speed High']);
        const currentGust = parseFloat(entry['Wind Gust High']);
        const refSpeed = parseFloat(kEntry['Wind Speed High']);
        const refGust = parseFloat(kEntry['Wind Gust High']);

        klaxWindSpeedDiff = (currentSpeed - refSpeed).toFixed(2);
        klaxWindGustDiff = (currentGust - refGust).toFixed(2);
      }

      return {
        ...entry,
        'Fire Distance (mi)': (fireDistKm * 0.621371).toFixed(2),
        'KCATOPAN8 Distance (mi)': (kcatopanDistKm * 0.621371).toFixed(2),
        'KLAX Distance (mi)': (klaxDistKm * 0.621371).toFixed(2),
        'KCATOPAN8 Wind Speed Difference': kcatopanWindSpeedDiff,
        'KCATOPAN8 Wind Gust Difference': kcatopanWindGustDiff,
        'KLAX Wind Speed Difference': klaxWindSpeedDiff,
        'KLAX Wind Gust Difference': klaxWindGustDiff
      };
    });

    const stationCsv = toCsv(enrichedRecords);
    const stationFilename = `${stationCode}.csv`;
    const outputPath = path.join(perStationOutputDir, stationFilename);
    fs.writeFileSync(outputPath, stationCsv, 'utf-8');

    if (excludedFromSummary.has(stationCode)) continue;

    let maxWindSpeed = 0;
    let maxWindSpeedTime = '2025-01-07T00:00';
    let maxWindGust = 0;
    let maxWindGustTime = '2025-01-07T00:00';

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

    let outputText = `Station Code: ${stationCode}\nMax Wind Speed High: ${maxWindSpeed} mph at ${displayWindSpeedTime}\nMax Wind Gust High: ${maxWindGust} mph at ${displayWindGustTime}\n`;

    const summaryRecord = {
      stationCode,
      maxWindSpeedHigh: maxWindSpeed,
      maxWindSpeedTime: maxWindSpeedTime,
      maxWindGustHigh: maxWindGust,
      maxWindGustTime: maxWindGustTime
    };

    if (stationInfo) {
      const fireDist = haversineDistance(stationInfo.Lat, stationInfo.Lng, fireLat, fireLng) * 0.621371;
      outputText += `Station Name: ${stationInfo.StationName}\nAddress: ${stationInfo.StationFullAddress || stationInfo.StationAddress || 'N/A'}\nZip Code: ${stationInfo.ZipCode || 'N/A'}\nLatitude: ${stationInfo.Lat}\nLongitude: ${stationInfo.Lng}\nDistance from fire: ${fireDist.toFixed(2)} miles\n`;

      Object.assign(summaryRecord, {
        stationName: stationInfo.StationName,
        stationAddress: stationInfo.StationFullAddress || stationInfo.StationAddress || null,
        zipCode: stationInfo.ZipCode || null,
        latitude: stationInfo.Lat,
        longitude: stationInfo.Lng,
        fireDistanceMiles: parseFloat(fireDist.toFixed(2))
      });
    } else {
      outputText += 'Station metadata not found.\n';
    }

    allOutput += outputText + '\n---\n\n';
    summaryJson.push(summaryRecord);
  }
}

function processRangedSummary(records) {
  const excludedFromSummary = new Set([
    //'KCALOSAN842',
    //'KCASANTA4733',
    //'KCASANTA630',
    //'KCATOPAN8'
  ]);

  const groupedByStation = records.reduce((acc, record) => {
    const station = record.Station;
    if (!acc[station]) acc[station] = [];
    acc[station].push(record);
    return acc;
  }, {});

  let rangedOutput = '';
  let rangedSummary = [];

  for (const stationCode in groupedByStation) {
    if (excludedFromSummary.has(stationCode)) continue;

    const stationRecords = groupedByStation[stationCode];
    const stationInfo = stationMap.find(s => s.StationCode === stationCode);

    // Filter records to time range 10:30 AM – 4:00 PM
    const filtered = stationRecords.filter(entry => {
      const m = moment(entry.DateTime);
      const hour = m.hour();
      const minute = m.minute();

      return (
        (hour > 10 && hour < 16) ||           // Between 11:00 AM and 3:59 PM
        (hour === 10 && minute >= 30) ||      // 10:30 AM to 10:59 AM
        (hour === 16 && minute === 0)         // Exactly 4:00 PM (optional)
      );
    });

    if (filtered.length === 0) continue;

    let maxWindSpeed = 0;
    let maxWindSpeedTime = '2025-01-07T00:00';
    let maxWindGust = 0;
    let maxWindGustTime = '2025-01-07T00:00';

    filtered.forEach(entry => {
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
[10AM–4PM] Max Wind Speed High: ${maxWindSpeed} mph at ${displayWindSpeedTime}
[10AM–4PM] Max Wind Gust High: ${maxWindGust} mph at ${displayWindGustTime}
`;

    const record = {
      stationCode,
      maxWindSpeedHigh: maxWindSpeed,
      maxWindSpeedTime: maxWindSpeedTime,
      maxWindGustHigh: maxWindGust,
      maxWindGustTime: maxWindGustTime
    };

    if (stationInfo) {
      const fireDist = haversineDistance(stationInfo.Lat, stationInfo.Lng, fireLat, fireLng) * 0.621371;

      outputText += `Station Name: ${stationInfo.StationName}
Address: ${stationInfo.StationFullAddress || stationInfo.StationAddress || 'N/A'}
Zip Code: ${stationInfo.ZipCode || 'N/A'}
Latitude: ${stationInfo.Lat}
Longitude: ${stationInfo.Lng}
Distance from fire: ${fireDist.toFixed(2)} miles
`;

      Object.assign(record, {
        stationName: stationInfo.StationName,
        stationAddress: stationInfo.StationFullAddress || stationInfo.StationAddress || null,
        zipCode: stationInfo.ZipCode || null,
        latitude: stationInfo.Lat,
        longitude: stationInfo.Lng,
        fireDistanceMiles: parseFloat(fireDist.toFixed(2))
      });
    }

    rangedOutput += outputText + '\n---\n\n';
    rangedSummary.push(record);
  }

  fs.writeFileSync(outputRangedTextFile, rangedOutput.trim(), 'utf-8');
  fs.writeFileSync(outputRangedJsonFile, JSON.stringify(rangedSummary, null, 2), 'utf-8');
  fs.writeFileSync(outputRangedCsvFile, toCsv(rangedSummary), 'utf-8');

  console.log(`Ranged summary written to ${outputRangedTextFile}`);
}

if (fs.existsSync(combinedCsvFile)) {
  const csvData = fs.readFileSync(combinedCsvFile, 'utf-8');
  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true
  });
  processRecords(records);
  processRangedSummary(records);
} else {
  console.error(`Error: Combined CSV file not found at ${combinedCsvFile}`);
}

fs.writeFileSync(outputTextFile, allOutput.trim(), 'utf-8');
fs.writeFileSync(outputJsonFile, JSON.stringify(summaryJson, null, 2), 'utf-8');
fs.writeFileSync(outputCsvFile, toCsv(summaryJson), 'utf-8');

console.log(`Summary written to ${outputTextFile}`);
console.log(`JSON data written to ${outputJsonFile}`);
console.log(`CSV data written to ${outputCsvFile}`);
console.log(`Per-station CSV files saved to ${perStationOutputDir}`);
