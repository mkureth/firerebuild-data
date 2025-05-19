const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { parse } = require('json2csv');
const moment = require('moment');

const sourceFolder = path.join(__dirname, '../data/SOURCE/daily/main-csv');
const destinationFolder = path.join(__dirname, '../data/SOURCE/daily/main-processed');

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

function formatData(inputString) {
    var outputString = inputString.split(' °')[0];
    return outputString;
};

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


fs.readdir(sourceFolder, (err, files) => {
    if (err) {
        console.error('Error reading source directory:', err);
        return;
    }

    files.filter(file => path.extname(file) === '.csv').forEach(file => {
        const inputFilePath = path.join(sourceFolder, file);
        const outputFilePath = path.join(destinationFolder, file); // Save to the destination folder
        const newRows = [];
        var filledData = [];
        const filePrefix = path.basename(file, '.csv');

        fs.createReadStream(inputFilePath) // Read from the source folder
            .pipe(csv())
            .on('data', (row) => {
                const keys = Object.keys(row);
                var newRow = {
                    Station: filePrefix.split('|')[0],
                    
                    DateTime: formatDate (filePrefix.split('|')[1], row.Time),

                    "Temperature High": formatData(row.Temperature),
                    "Temperature Low": formatData(row.Temperature),

                    "Wind Speed High": formatData(row['Wind Speed']),
                    "Wind Speed Low": formatData(row['Wind Speed']),

                    "Wind Gust High": formatData(row['Wind Gust']),
                    "Wind Gust Low": formatData(row['Wind Gust']),

                    "Wind Direction": formatData(row['Wind']),

                    "Precipitation": formatData(row['Precip.']),
                    "Dew Point": formatData(row['Dew Point']),
                    "Humidity": formatData(row['Humidity']),
                    "Pressure": formatData(row['Pressure']),
                    "Condition": formatData(row['Condition']),
                };
                newRows.push(newRow);
                const sortedData = Object.values(newRows).sort((a, b) => new Date(a.DateTime) - new Date(b.DateTime));
                filledData = fillMissingIntervals(sortedData);
            })
            .on('end', () => {
                if (filledData.length > 0) {
                    try {
                        const csvData = parse(filledData);
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
