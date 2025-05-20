const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');
const moment = require('moment');

const inputDir = path.resolve(__dirname, '../../../data/SOURCE/weather/monthly/main-csv');
const outputDir = path.resolve(__dirname, '../../../data/SOURCE/weather/monthly/main-processed');

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Define CSV headers
const headers = [
  { id: 'Station', title: 'Station' },
  { id: 'DateTime', title: 'DateTime' },
  { id: 'Temperature Max', title: 'Temperature Max' },
  { id: 'Temperature Min', title: 'Temperature Min' },
  { id: 'Wind Speed Max', title: 'Wind Speed Max' },
  { id: 'Wind Speed Min', title: 'Wind Speed Min' },
  { id: 'Dew Point Max', title: 'Dew Point Max' },
  { id: 'Dew Point Min', title: 'Dew Point Min' },
  { id: 'Humidity Max', title: 'Humidity Max' },
  { id: 'Humidity Min', title: 'Humidity Min' },
  { id: 'Pressure Max', title: 'Pressure Max' },
  { id: 'Pressure Min', title: 'Pressure Min' },
  { id: 'Precipitation', title: 'Precipitation' }
];

// Process all files in the input directory
fs.readdirSync(inputDir).forEach(file => {
  if (file.endsWith('.csv')) {
    const station = file.split('|')[0];
    const inputFile = path.join(inputDir, file);
    const outputFile = path.join(outputDir, file);

    const rows = [];

    fs.createReadStream(inputFile)
      .pipe(csv())
      .on('data', (data) => {
        rows.push({
          Station: station,
          //DateTime: `${data['Date']}T00:00`,
          DateTime: moment(data['Date']).format('YYYY-MM-DDTHH:mm'),
          'Temperature Max': data['Temperature Max'] || '',
          'Temperature Min': data['Temperature Min'] || '',
          'Wind Speed Max': data['Wind Speed Max'] || '',
          'Wind Speed Min': data['Wind Speed Min'] || '',
          'Dew Point Max': data['Dew Point Max'] || '',
          'Dew Point Min': data['Dew Point Min'] || '',
          'Humidity Max': data['Humidity Max'] || '',
          'Humidity Min': data['Humidity Min'] || '',
          'Pressure Max': data['Pressure Max'] || '',
          'Pressure Min': data['Pressure Min'] || '',
          'Precipitation': data['Total Precipitation Inches'] || '',
        });
      })
      .on('end', () => {
        const csvWriter = createObjectCsvWriter({
          path: outputFile,
          header: headers
        });

        csvWriter.writeRecords(rows)
          .then(() => {
            console.log(`Processed: ${file}`);
          })
          .catch(err => {
            console.error(`Failed to write ${file}:`, err);
          });
      });
  }
});
