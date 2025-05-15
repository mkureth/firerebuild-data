const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const { parse } = require('json2csv');
const moment = require('moment');

const inputFiles = [
  'data/main-combined/combined.csv',
  'data/station-combined/combined.csv'
];
const outputFile = 'data/all-merged/final-combined.csv';

// Optional: Time format and wind direction conversion
const ENABLE_TIME_REFORMAT = true;
const ENABLE_WIND_CONVERSION = true;

const compassToDegrees = {
  N: 0,
  NNE: 22.5,
  NE: 45,
  ENE: 67.5,
  E: 90,
  ESE: 112.5,
  SE: 135,
  SSE: 157.5,
  S: 180,
  SSW: 202.5,
  SW: 225,
  WSW: 247.5,
  W: 270,
  WNW: 292.5,
  NW: 315,
  NNW: 337.5,
  CALM: ''
};

function reformatTime(value) {
    const inputTime = value;
    const inputFormat = "h:mmA";
    const outputFormat = "HH:mm";
    const momentObj = moment(inputTime, inputFormat);
    const formattedTime = momentObj.format(outputFormat);
    return formattedTime;
}

function convertWindDirection(value) {
  const trimmed = value.trim().toUpperCase();
  return compassToDegrees[trimmed] !== undefined ? compassToDegrees[trimmed] : value;
}

function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

(async () => {
  try {
    const allRows = [];

    for (const file of inputFiles) {
      const rows = await readCSV(file);

      const processed = rows.map(row => {
        const newRow = { ...row };

        for (const key in newRow) {
          if (ENABLE_TIME_REFORMAT && key.toLowerCase().includes('time')) {
            newRow[key] = reformatTime(newRow[key]);
          }

          if (ENABLE_WIND_CONVERSION && key == 'Wind') {
            newRow[key] = convertWindDirection(newRow[key]);
          }
        }



        //delete unused
        delete newRow['Pressure'];
        delete newRow['Precipitation'];
        delete newRow['Humidity'];
        delete newRow['Dew Point'];
        delete newRow['Condition'];
        delete newRow['Wind'];
        return newRow;
      });

      allRows.push(...processed);
    }

    const csvOutput = parse(allRows);
    fs.writeFileSync(outputFile, csvOutput, 'utf-8');
    console.log(`Combined CSV saved to: ${outputFile}`);
  } catch (err) {
    console.error('Error processing CSV files:', err.message);
  }
})();
