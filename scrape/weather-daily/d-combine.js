const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Parser } = require('json2csv');

const inputFolder = path.join(__dirname, 'data/csvdate');
const outputCSVFile = path.join(__dirname, 'data/combined/combined.csv');
const outputJSONFile = path.join(__dirname, 'data/combined/combined.json');

let allData = [];
let headersSet = new Set();

fs.readdir(inputFolder, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }
    
    let csvFiles = files.filter(file => path.extname(file) === '.csv');
    let fileReadCount = 0;

    csvFiles.forEach(file => {
        let filePath = path.join(inputFolder, file);
        let fileData = [];
        
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                if ('Time' in row) {
                    row['Source Weather'] = row['Time'].split('|')[0];
                    let [date, time] = row['Time'].split('|').map(val => val.trim());
                    
                    if (date && time) {
                        let newDate = new Date(date);
                        let [hour, minute] = time.split(':');
                        let [min, ampm] = minute.split(' ');
                        if (hour == 12 && ampm == 'AM') { // Between 12:00 AM and 12:59 AM
                            if (!isNaN(newDate.getTime())) {
                                newDate.setDate(newDate.getDate() + 1);
                            }
                        }
                        date = newDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
                    }

                    row['Date'] = date || '';  
                    row['Time'] = time || '';
                }

                if ('Temperature' in row) {
                    row['Temperature'] = row['Temperature'].split(' ')[0];
                }

                if ('Dew Point' in row) {
                    row['Dew Point'] = row['Dew Point'].split(' ')[0];
                }

                if ('Humidity' in row) {
                    row['Humidity'] = row['Humidity'].split(' ')[0];
                }

                if ('Wind Speed' in row) {
                    row['Wind Speed'] = row['Wind Speed'].split(' ')[0];
                }

                if ('Wind Gust' in row) {
                    row['Wind Gust'] = row['Wind Gust'].split(' ')[0];
                }

                if ('Pressure' in row) {
                    row['Pressure'] = row['Pressure'].split(' ')[0];
                }

                if ('Precip.' in row) {
                    row['Precipitation'] = row['Precip.'].split(' ')[0];
                    delete row['Precip.'];
                }

                let newRow = {};
                Object.keys(row).forEach(header => {
                    if (header === 'Time') {
                        newRow['Date'] = row['Date'];
                        newRow['Time'] = row['Time'];
                    } else if (header !== 'Date') {
                        newRow[header] = row[header];
                    }
                    headersSet.add(header);
                });

                fileData.push(newRow);
            })
            .on('end', () => {
                allData = allData.concat(fileData);
                fileReadCount++;
                
                if (fileReadCount === csvFiles.length) {
                    writeCombinedFiles();
                }
            });
    });
});

function writeCombinedFiles() {
    let headers = Array.from(headersSet);
    
    // Ensure 'Date' appears before 'Time'
    if (headers.includes('Time') && headers.includes('Date')) {
        headers = ['Date', 'Time', ...headers.filter(h => h !== 'Date' && h !== 'Time')];
    }

    const json2csvParser = new Parser({ fields: headers });
    const csvOutput = json2csvParser.parse(allData);
    
    fs.writeFileSync(outputCSVFile, csvOutput);
    console.log('Combined CSV created successfully:', outputCSVFile);
    
    fs.writeFileSync(outputJSONFile, JSON.stringify(allData, null, 2));
    console.log('Combined JSON created successfully:', outputJSONFile);
}
