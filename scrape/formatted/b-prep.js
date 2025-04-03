const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const { parse } = require('json2csv');

const inputFiles = [
    './data/raw/weather-daily.csv',
    './data/raw/fire-ca-gov.csv'
];
const outputCsvPath = './data/prep/prep.csv';
const outputJsonPath = './data/prep/prep.json';

let combinedData = [];

// Function to read and parse CSV files
const readCsv = (filePath) => {
    return new Promise((resolve, reject) => {
        const data = [];
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row) => data.push(row))
            .on('end', () => resolve(data))
            .on('error', (error) => reject(error));
    });
};

// Function to convert 12-hour time to military time
const convertToMilitaryTime = (time) => {
    if (!time) return '';
    const match = time.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
    if (!match) return time;
    let [_, hours, minutes, period] = match;
    hours = parseInt(hours, 10);
    if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
    if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

// Process all files
Promise.all(inputFiles.map(readCsv))
    .then(results => {
        combinedData = results.flat();

        combinedData.forEach(function(content, index) {
            delete combinedData[index]['Name'];
            delete combinedData[index]['Start Date/Time'];
            delete combinedData[index]['Incident Status'];
            delete combinedData[index]['Location'];
            delete combinedData[index]['Administration Unit'];
            delete combinedData[index]['Type'];
            delete combinedData[index]['Cause'];
            delete combinedData[index]['Counties'];

            let newDate = new Date(combinedData[index]['Date']);
            combinedData[index]['Date'] = newDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

            combinedData[index]['Source Fire CA'] = combinedData[index]['guid'];
            delete combinedData[index]['guid'];

            // Convert time to military format
            if (combinedData[index]['Time']) {
                combinedData[index]['Time'] = convertToMilitaryTime(combinedData[index]['Time']);
            }
        });
        
        // Sort combinedData by Date then Time
        combinedData.sort((a, b) => {
            const dateA = a['Date'] ? new Date(a['Date']) : new Date(0);
            const dateB = b['Date'] ? new Date(b['Date']) : new Date(0);
            if (dateA - dateB !== 0) return dateA - dateB;
            return a['Time'] && b['Time'] ? a['Time'].localeCompare(b['Time']) : 0;
        });
        
        // Ensure output directory exists
        fs.mkdir(path.dirname(outputCsvPath), { recursive: true }, (err) => {
            if (err) {
                console.error('Error creating output directory:', err);
                return;
            }
            
            // Write JSON output
            fs.writeFile(outputJsonPath, JSON.stringify(combinedData, null, 2), (err) => {
                if (err) console.error('Error writing JSON file:', err);
                else console.log('JSON file saved successfully!');
            });
            
            // Write CSV output
            try {
                const csvData = parse(combinedData);
                fs.writeFile(outputCsvPath, csvData, (err) => {
                    if (err) console.error('Error writing CSV file:', err);
                    else console.log('CSV file saved successfully!');
                });
            } catch (err) {
                console.error('Error converting data to CSV:', err);
            }
        });
    })
    .catch(error => console.error('Error processing files:', error));
