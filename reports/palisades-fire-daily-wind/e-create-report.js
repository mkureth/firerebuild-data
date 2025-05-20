const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { writeToPath } = require('fast-csv');

const inputFilePath = path.resolve(__dirname, '../../data/PROCESSED/weather/day/combined.csv');
const outputCSV = path.resolve(__dirname, '../../data/REPORTS/weather/palisades-fire-daily-wind/reports/final-combined-report.csv');
const outputJSON = path.resolve(__dirname, '../../data/REPORTS/weather/palisades-fire-daily-wind/reports/final-combined-report.json');

const excludedStations = ['KCATOPAN8'];
const data = [];

fs.createReadStream(inputFilePath)
  .pipe(csv())
  .on('data', (row) => {
    // Skip excluded stations
    if (excludedStations.includes(row.Station)) return;

    const formattedRow = {
      Station: row.Station,
      DateTime: row.DateTime,
      TemperatureHigh: parseFloat(row['Temperature High']) || 0,
      TemperatureLow: parseFloat(row['Temperature Low']) || 0,
      WindSpeedHigh: parseFloat(row['Wind Speed High']) || 0,
      WindSpeedLow: parseFloat(row['Wind Speed Low']) || 0,
      WindGustHigh: parseFloat(row['Wind Gust High']) || 0,
      WindGustLow: parseFloat(row['Wind Gust Low']) || 0,
      WindDirection: row['Wind Direction'],
      Precipitation: parseFloat(row.Precipitation) || 0,
      DewPoint: parseFloat(row['Dew Point']) || 0,
      Humidity: parseFloat(row.Humidity) || 0,
      Pressure: parseFloat(row.Pressure) || 0,
      Condition: row.Condition
    };

    data.push(formattedRow);
  })
  .on('end', () => {
    // Sort by DateTime
    data.sort((a, b) => new Date(a.DateTime) - new Date(b.DateTime));

    // Group and reduce by DateTime
    const reportMap = new Map();

    data.forEach((entry) => {
      const key = entry.DateTime;
      if (!reportMap.has(key)) {
        reportMap.set(key, {
          DateTime: key,
          'Wind Speed High': entry.WindSpeedHigh,
          'Station Wind Speed High': entry.Station,
          'Wind Gust High': entry.WindGustHigh,
          'Station Wind Gust High': entry.Station
        });
      } else {
        const existing = reportMap.get(key);
        if (entry.WindSpeedHigh > existing['Wind Speed High']) {
          existing['Wind Speed High'] = entry.WindSpeedHigh;
          existing['Station Wind Speed High'] = entry.Station;
        }
        if (entry.WindGustHigh > existing['Wind Gust High']) {
          existing['Wind Gust High'] = entry.WindGustHigh;
          existing['Station Wind Gust High'] = entry.Station;
        }
      }
    });

    const finalReport = Array.from(reportMap.values());

    // Write JSON output
    fs.writeFileSync(outputJSON, JSON.stringify(finalReport, null, 2));

    // Write CSV output
    writeToPath(outputCSV, finalReport, { headers: true })
      .on('finish', () => console.log('CSV and JSON reports written successfully.'))
      .on('error', (err) => console.error('Error writing CSV:', err));
  });
