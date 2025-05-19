const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');

const inputDirs = [
  '../data/SOURCE/daily/station-processed/KCAPACIF320',
  //'../data/SOURCE/daily/main-processed'
];
const outputFilePath = '../data/PROCESSED/daily/stations/combined-KCAPACIF320.csv';

async function readCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', data => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function getAllCSVData(directories) {
  const allData = [];
  let headers = null;

  for (const dir of directories) {
    const files = fs.readdirSync(dir).filter(file => file.endsWith('.csv'));
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const data = await readCSVFile(fullPath);
      if (data.length > 0) {
        headers = headers || Object.keys(data[0]);
        allData.push(...data);
      }
    }
  }

  return { headers, allData };
}

async function writeCombinedCSV(headers, data, outputPath) {
  const csvWriter = createObjectCsvWriter({
    path: outputPath,
    header: headers.map(header => ({ id: header, title: header }))
  });
  await csvWriter.writeRecords(data);
  console.log(`Combined CSV written to ${outputPath}`);
}

(async () => {
  try {
    const { headers, allData } = await getAllCSVData(inputDirs);
    if (!headers || allData.length === 0) {
      console.error('No CSV data found.');
      return;
    }

    // Ensure output directory exists
    fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });

    await writeCombinedCSV(headers, allData, outputFilePath);
  } catch (error) {
    console.error('Error:', error);
  }
})();
