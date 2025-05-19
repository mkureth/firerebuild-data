const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { parse } = require('json2csv');

// Define input and output directories
const inputDir = path.join(__dirname, '../data/SOURCE/day/station-json-clean');
const outputDir = path.join(__dirname, '../data/SOURCE/day/station-processed');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function roundToNearest15Min(momentObj) {
  const minutes = momentObj.minutes();
  const rounded = Math.round(minutes / 15) * 15;
  return momentObj.minutes(rounded).seconds(0).milliseconds(0);
}

function mergeRecords(existing, incoming) {
  return {
    Station: existing.Station,
    DateTime: existing.DateTime,
    
    "Temperature High": Math.max(existing["Temperature High"] ?? null, incoming["Temperature High"] ?? null),
    "Temperature Low": Math.min(existing["Temperature Low"] ?? null, incoming["Temperature Low"] ?? null),

    "Wind Speed High": Math.max(existing["Wind Speed High"] ?? null, incoming["Wind Speed High"] ?? null),
    "Wind Speed Low": Math.min(existing["Wind Speed Low"] ?? null, incoming["Wind Speed Low"] ?? null),

    "Wind Gust High": Math.max(existing["Wind Gust High"] ?? null, incoming["Wind Gust High"] ?? null),
    "Wind Gust Low": Math.min(existing["Wind Gust Low"] ?? null, incoming["Wind Gust Low"] ?? null),

    "Wind Direction": Math.min(existing["Wind Direction"] ?? null, incoming["Wind Direction"] ?? null),
    "Precipitation": Math.min(existing["Precipitation"] ?? null, incoming["Precipitation"] ?? null),
    "Dew Point": Math.min(existing["Dew Point"] ?? null, incoming["Dew Point"] ?? null),
    "Humidity": Math.min(existing["Humidity"] ?? null, incoming["Humidity"] ?? null),
    "Pressure": Math.min(existing["Pressure"] ?? null, incoming["Pressure"] ?? null),
    "Condition": 'none',
  };
}

// Fill missing 15-min intervals
function fillMissingIntervals(data) {
  const filled = [];
  const byDateHour = {};

  data.forEach(entry => {
    const dt = moment.parseZone(entry.DateTime);
    const dateKey = dt.format('YYYY-MM-DD');
    const hourKey = dt.format('YYYY-MM-DDTHH');

    if (!byDateHour[hourKey]) {
      byDateHour[hourKey] = {};
    }

    const minuteKey = dt.format('mm');
    byDateHour[hourKey][minuteKey] = entry;
  });

  Object.keys(byDateHour).sort().forEach(hourKey => {
    const baseTime = moment.parseZone(hourKey + ':00:00Z'); // e.g. 2024-01-01T13
    const minutesToCheck = ['00', '15', '30', '45'];

    minutesToCheck.forEach(minute => {
      const dt = baseTime.clone().minutes(Number(minute)).seconds(0).milliseconds(0);
      //const isoTime = dt.format('YYYY-MM-DDTHH:mm:ssZ');
      const isoTime = dt.format('YYYY-MM-DDTHH:mm');
      const existing = byDateHour[hourKey][minute];

      if (existing) {
        filled.push({ ...existing, DateTime: isoTime });
      } else {
        // Fallback to any available record from this hour (use 00 if available)
        const fallback = byDateHour[hourKey]['00'] || Object.values(byDateHour[hourKey])[0];
        if (fallback) {
          filled.push({ ...fallback, DateTime: isoTime });
        }
      }
    });
  });

  return filled.sort((a, b) => new Date(a.DateTime) - new Date(b.DateTime));
}

// Process each file
fs.readdirSync(inputDir).forEach(file => {
  if (path.extname(file) === '.json') {
    const inputPath = path.join(inputDir, file);
    const outputPathJson = path.join(outputDir, file);
    const outputPathCsv = path.join(outputDir, file.replace('.json', '.csv'));

    try {
      const rawData = fs.readFileSync(inputPath, 'utf-8');
      const data = JSON.parse(rawData);

      const mergedData = {};

      data.forEach(entry => {
        let obsMoment = moment.parseZone(entry.obsTimeLocal);
        obsMoment = roundToNearest15Min(obsMoment);
        const isoDateTime = obsMoment.format('YYYY-MM-DDTHH:mm:ssZ');

        const record = {
          Station: entry.stationID,
          DateTime: isoDateTime,

          "Temperature High": entry.imperial?.tempHigh ?? null,
          "Temperature Low": entry.imperial?.tempLow ?? null,

          "Wind Speed High": entry.imperial?.windspeedHigh ?? null,
          "Wind Speed Low": entry.imperial?.windspeedLow ?? null,

          "Wind Gust High": entry.imperial?.windgustHigh ?? null,
          "Wind Gust Low": entry.imperial?.windgustLow ?? null,

          "Wind Direction": entry.winddirAvg ?? 0,
          "Precipitation": entry.imperial?.precipTotal ?? 0,
          "Dew Point": entry.imperial?.dewptAvg ?? 0,
          "Humidity": entry.humidityAvg ?? 0,
          "Pressure": entry.imperial?.pressureMax ?? 0,
          "Condition": 'none',
        };

        if (mergedData[isoDateTime]) {
          mergedData[isoDateTime] = mergeRecords(mergedData[isoDateTime], record);
        } else {
          mergedData[isoDateTime] = record;
        }
      });

      // Sort and fill missing time intervals
      const sortedData = Object.values(mergedData).sort((a, b) => new Date(a.DateTime) - new Date(b.DateTime));
      const filledData = fillMissingIntervals(sortedData);

      //fs.writeFileSync(outputPathJson, JSON.stringify(filledData), 'utf-8');
      const csv = parse(filledData);
      fs.writeFileSync(outputPathCsv, csv, 'utf-8');

      console.log(`Formatted and filled data for: ${file}`);
    } catch (err) {
      console.error(`Error processing file ${file}:`, err.message);
    }
  }
});
