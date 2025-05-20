const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const fastcsv = require('fast-csv');

const inputDir = path.resolve(__dirname, '../../../data/PROCESSED/weather/daily/stations/');
const outputCsvPath = path.resolve(__dirname, '../../../data/REPORTS/formatted/reports/prep-stations.csv');
const outputJsonPath = path.resolve(__dirname, '../../../data/REPORTS/formatted/reports/prep-stations.json');

const startDate = new Date('2025-01-07');
const endDate = new Date('2025-01-09');

// Desired station IDs to include
const stationIds = [
  'KCAMALIB62', 'KCAPACIF132', 'KCAMALIB87', 'KCAPACIF208', 'KCALOSAN958',
  'KCAPACIF227', 'KCAPACIF287', 'KCAMALIB133', 'KCAPACIF320'
];

const mergedByDate = {};

function isInDateRange(dateStr) {
  const date = new Date(dateStr);
  return date >= startDate && date <= endDate;
}

async function processCSV(filePath) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const { Station, 'DateTime': Date, 'Wind Speed High': Speed, 'Wind Gust High': Gust } = row;

        if (stationIds.includes(Station) && isInDateRange(Date)) {
          if (!mergedByDate[Date]) mergedByDate[Date] = { date: Date };
          mergedByDate[Date][`${Station}_s`] = Speed;
          mergedByDate[Date][`${Station}_g`] = Gust;
        }
      })
      .on('end', () => resolve())
      .on('error', reject);
  });
}

async function main() {
  try {
    const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.csv'));

    for (const file of files) {
      await processCSV(path.join(inputDir, file));
    }

    const outputRows = Object.values(mergedByDate).sort((a, b) => new Date(a.date) - new Date(b.date));
    const headers = ['date', ...stationIds.flatMap(id => [`${id}_s`, `${id}_g`])];

    // Write CSV
    const csvStream = fs.createWriteStream(outputCsvPath);
    fastcsv
      .write(outputRows, { headers })
      .pipe(csvStream)
      .on('finish', () => console.log('CSV saved:', outputCsvPath));

    // Write JSON
    fs.writeFileSync(outputJsonPath, JSON.stringify(outputRows, null, 2), 'utf8');
    console.log('JSON saved:', outputJsonPath);

  } catch (err) {
    console.error('Error:', err);
  }
}

main();
