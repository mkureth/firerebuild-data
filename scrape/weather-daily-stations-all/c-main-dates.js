const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { parse } = require('json2csv');
const moment = require('moment');

const sourceFolder = path.join(__dirname, 'data/main-csv');
const destinationFolder = path.join(__dirname, 'data/main-csvdate');

// Ensure the destination folder exists
if (!fs.existsSync(destinationFolder)){
    fs.mkdirSync(destinationFolder, { recursive: true });
}

function roundToNearest15Min(momentObj) {
  const minutes = momentObj.minutes();
  const rounded = Math.round(minutes / 15) * 15;
  return momentObj.minutes(rounded).seconds(0).milliseconds(0);
}

function formatDate(dateString, timeString) {
    let obsMoment = moment(`${dateString} ${timeString}`, 'YYYY-MM-DD H:mm A');
    let inputDateFix = obsMoment.date();

    obsMoment = roundToNearest15Min(obsMoment);
    let outputDateFix = obsMoment.date();

    if (inputDateFix === outputDateFix && obsMoment.minutes() === 0) {
        if (obsMoment.hour() === 0 || obsMoment.hour() === 1) {
            obsMoment.add(1, 'day');
        }
    }

    const isoDateTime = obsMoment.format('YYYY-MM-DDTHH:mm:ssZ');
    return isoDateTime;
};

fs.readdir(sourceFolder, (err, files) => {
    if (err) {
        console.error('Error reading source directory:', err);
        return;
    }

    files.filter(file => path.extname(file) === '.csv').forEach(file => {
        const inputFilePath = path.join(sourceFolder, file);
        const outputFilePath = path.join(destinationFolder, file); // Save to the destination folder
        const newRows = [];
        const filePrefix = path.basename(file, '.csv');

        fs.createReadStream(inputFilePath) // Read from the source folder
            .pipe(csv())
            .on('data', (row) => {
                const keys = Object.keys(row);
                var newRow = {
                    Station: filePrefix.split('|')[0],
                    DateTime: formatDate (filePrefix.split('|')[1], row.Time),
                    "Temperature High": row.Temperature,
                    "Wind Speed High": row['Wind Speed'],
                    "Wind Gust High": row['Wind Gust'],
                    "Temperature Low": row.Temperature,
                    "Wind Speed Low": row['Wind Speed'],
                    "Wind Gust Low": row['Wind Gust'],
                };
                newRows.push(newRow);
            })
            .on('end', () => {
                if (newRows.length > 0) {
                    try {
                        const csvData = parse(newRows);
                        fs.writeFile(outputFilePath, csvData, (err) => { // Write to the destination folder
                            if (err) {
                                console.error(`Error writing file ${file}:`, err);
                            } else {
                                console.log(`Processed and saved: ${file} to ${destinationFolder}`);
                            }
                        });
                    } catch (parseErr) {
                        console.error(`Error parsing CSV data for file ${file}:`, parseErr);
                    }
                } else {
                    console.log(`No data rows found in file ${file}. Skipping write.`);
                }
            })
            .on('error', (streamErr) => {
                console.error(`Error reading stream for file ${file}:`, streamErr);
            });
    });
});
