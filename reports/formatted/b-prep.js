const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const { parse } = require('json2csv');
const moment = require('moment');

const inputFiles = [
    '../../data/PROCESSED/weather/daily/stations/combined-KLAX.csv',
    '../../data/PROCESSED/fire/fire-ca-gov/combined.csv'
];
const outputCsvPath = '../../data/REPORTS/formatted/reports/prep.csv';
const outputJsonPath = '../../data/REPORTS/formatted/reports/prep.json';


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

const formatDisplayDate = (dateStr, timeStr) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';

    // Increment the date by one day
    date.setDate(date.getDate() + 1);

    // Format date as 'Jan 8' (assuming original was 'Jan 7')
    const options = { month: 'short', day: 'numeric' };
    let formattedDate = date.toLocaleDateString('en-US', options);

    // Format time as '11:06AM' (time remains the same)
    if (timeStr) {
        let [hours, minutes] = timeStr.split(':');
        hours = parseInt(hours, 10);
        const period = hours >= 12 ? 'PM' : 'AM';
        if (hours > 12) hours -= 12;
        if (hours === 0) hours = 12;
        formattedDate += ` - ${hours}:${minutes}${period}`;
    }

    return formattedDate;
};

const filterDates = (inputData) => {
    var outputData = [];
    for (var i = 0; i <inputData.length; i++) {        
        const dateToCheck = moment(inputData[i].DateTime);
        const startDate = moment('2025-01-03');
        const endDate = moment('2025-02-11');
        const isBetweenInclusive = dateToCheck.isBetween(startDate, endDate, null, '[]');
        if (isBetweenInclusive) {
            outputData.push(inputData[i]);    
        }
    }
    return outputData;
};

/*
            



*/

const renameKeys = (inputData) => {
    //var outputData = [];
    for (var i = 0; i <inputData.length; i++) {        
        inputData[i]['Temperature'] = inputData[i]['Temperature High'];
        delete inputData[i]['Temperature High'];
        delete inputData[i]['Temperature Low'];

        inputData[i]['Wind Speed'] = inputData[i]['Wind Speed High'];
        delete inputData[i]['Wind Speed High'];
        delete inputData[i]['Wind Speed Low'];

        inputData[i]['Wind Gust'] = inputData[i]['Wind Gust High'];
        delete inputData[i]['Wind Gust High'];
        delete inputData[i]['Wind Gust Low'];

        inputData[i]['Wind'] = inputData[i]['Wind Direction'];
        delete inputData[i]['Wind Direction'];


    }
    return inputData;
};

// Process all files
Promise.all(inputFiles.map(readCsv))
    .then(results => {
        combinedData = results.flat();
        combinedData = filterDates(combinedData);
        combinedData = renameKeys(combinedData);

        combinedData.forEach(function(content, index) {
            delete combinedData[index]['Name'];
            delete combinedData[index]['Start Date/Time'];
            delete combinedData[index]['Incident Status'];
            delete combinedData[index]['Location'];
            delete combinedData[index]['Administration Unit'];
            delete combinedData[index]['Type'];
            delete combinedData[index]['Cause'];
            delete combinedData[index]['Counties'];
            delete combinedData[index]['Station'];

            
            combinedData[index]['Date'] = combinedData[index]['DateTime'];// 

            //let newDate = new Date(combinedData[index]['DateTime']);


            let newDate = new Date(combinedData[index]['Date']);
            combinedData[index]['Source Weather'] = newDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

            combinedData[index]['Source Fire CA'] = combinedData[index]['guid'];
            delete combinedData[index]['guid'];

            // Convert time to military format
            if (combinedData[index]['Time']) {
                combinedData[index]['Time'] = convertToMilitaryTime(combinedData[index]['Time']);
            }

            combinedData[index]['Display Date'] = formatDisplayDate(combinedData[index]['Date'], combinedData[index]['Time']);

            delete combinedData[index]['DateTime'];
        });
        
        // Sort combinedData by Date then Time
        combinedData.sort((a, b) => {
            const dateA = a['Date'] ? new Date(a['Date']) : new Date(0);
            const dateB = b['Date'] ? new Date(b['Date']) : new Date(0);
            if (dateA - dateB !== 0) return dateA - dateB;
            return a['Time'] && b['Time'] ? a['Time'].localeCompare(b['Time']) : 0;
        });

        combinedData.forEach(function(content, index) {
            if (typeof content['Temperature'] === 'undefined' && index > 0) {
                combinedData[index]['Temperature'] = combinedData[index - 1]['Temperature'];
            }
            if (typeof content['Dew Point'] === 'undefined' && index > 0) {
                combinedData[index]['Dew Point'] = combinedData[index - 1]['Dew Point'];
            }
            if (typeof content['Humidity'] === 'undefined' && index > 0) {
                combinedData[index]['Humidity'] = combinedData[index - 1]['Humidity'];
            }
            if (typeof content['Wind'] === 'undefined' && index > 0) {
                combinedData[index]['Wind'] = combinedData[index - 1]['Wind'];
            }
            if (typeof content['Wind Speed'] === 'undefined' && index > 0) {
                combinedData[index]['Wind Speed'] = combinedData[index - 1]['Wind Speed'];
            }
            if (typeof content['Wind Gust'] === 'undefined' && index > 0) {
                combinedData[index]['Wind Gust'] = combinedData[index - 1]['Wind Gust'];
            }
            if (typeof content['Pressure'] === 'undefined' && index > 0) {
                combinedData[index]['Pressure'] = combinedData[index - 1]['Pressure'];
            }
            if (typeof content['Condition'] === 'undefined' && index > 0) {
                combinedData[index]['Condition'] = combinedData[index - 1]['Condition'];
            }
            if (typeof content['Precipitation'] === 'undefined' && index > 0) {
                combinedData[index]['Precipitation'] = combinedData[index - 1]['Precipitation'];
            }
            if (typeof content['Size'] === 'undefined' && index > 0) {
                combinedData[index]['Size'] = combinedData[index - 1]['Size'];
            }
            if (typeof content['Containment'] === 'undefined' && index > 0) {
                combinedData[index]['Containment'] = combinedData[index - 1]['Containment'];
            }
            if (typeof content['Structures Threatened'] === 'undefined' && index > 0) {
                combinedData[index]['Structures Threatened'] = combinedData[index - 1]['Structures Threatened'];
            }
            if (typeof content['Structures Destroyed'] === 'undefined' && index > 0) {
                combinedData[index]['Structures Destroyed'] = combinedData[index - 1]['Structures Destroyed'];
            }
            if (typeof content['Civilian Injuries'] === 'undefined' && index > 0) {
                combinedData[index]['Civilian Injuries'] = combinedData[index - 1]['Civilian Injuries'];
            }
            if (typeof content['Civilian Fatalities'] === 'undefined' && index > 0) {
                combinedData[index]['Civilian Fatalities'] = combinedData[index - 1]['Civilian Fatalities'];
            }
            if (typeof content['Structures Damaged'] === 'undefined' && index > 0) {
                combinedData[index]['Structures Damaged'] = combinedData[index - 1]['Structures Damaged'];
            }
            if (typeof content['Firefighter Injuries'] === 'undefined' && index > 0) {
                combinedData[index]['Firefighter Injuries'] = combinedData[index - 1]['Firefighter Injuries'];
            }

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
