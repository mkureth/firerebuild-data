const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const moment = require('moment');

const inputJsonFile = 'data/all-station-dates/output_sorted.json';
const outputCsvFile = 'data/all-station-dates/combined.csv';
const outputJsonFile = 'data/all-station-dates/combined.json';

function roundToNearest15(dateString, timeString) {
    const dateTimeString = `${dateString} ${timeString}`;
    const formatString = "YYYY-MM-DD HH:mm";
    const m = moment(dateTimeString, formatString);

    const minutes = Math.round(m.minutes() / 15) * 15;
    if (minutes === 60) {
        m.add(1, 'hour').startOf('hour');
    } else {
        m.minutes(minutes).seconds(0).milliseconds(0);
    }
    return m.utc().format('YYYY-MM-DDTHH:mm:00[Z]');
}

function loadJSON(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) return reject(err);
            try {
                resolve(JSON.parse(data));
            } catch (e) {
                reject(e);
            }
        });
    });
}

function saveCSV(data, headers, outputPath) {
    const csvWriter = createCsvWriter({
        path: outputPath,
        header: headers.map(h => ({ id: h, title: h }))
    });
    return csvWriter.writeRecords(data);
}

function saveJSON(data, outputPath) {
    return fs.promises.writeFile(outputPath, JSON.stringify(data, null, 2));
}

function generateAllTimesForJan7() {
    const times = [];
    const base = moment.utc('2024-01-07T00:00:00Z');
    for (let i = 0; i < 96; i++) { // 96 intervals of 15 minutes
        times.push(base.clone().add(i * 15, 'minutes').format('YYYY-MM-DDTHH:mm:00[Z]'));
    }
    return times;
}

function processData(rows) {
    const tempMap = new Map();
    let headers = [];

    for (const row of rows) {
        const timeKey = roundToNearest15(row.Date, row.Time);
        const entry = tempMap.get(timeKey) || {};
        headers = headers.length ? headers : Object.keys(row).filter(h => !['Date', 'Time', 'Timestamp'].includes(h));

        for (const col of headers) {
            const currentVal = parseFloat(entry[col] || 0);
            const newVal = parseFloat(row[col] || 0);
            entry[col] = Math.max(currentVal, newVal);
        }

        tempMap.set(timeKey, entry);
    }

    const allJan7Times = generateAllTimesForJan7();
    for (const time of allJan7Times) {
        if (!tempMap.has(time)) {
            tempMap.set(time, Object.fromEntries(headers.map(h => [h, 0])));
        }
    }

    // Fill 15/30/45 mins with value from 00 if zero
    const sortedTimes = Array.from(tempMap.keys()).sort();
    for (const time of sortedTimes) {
        const minute = moment(time).minutes();
        if ([15, 30, 45].includes(minute)) {
            const baseTime = moment(time).minutes(0).utc().format('YYYY-MM-DDTHH:mm:00[Z]');
            const current = tempMap.get(time);
            const base = tempMap.get(baseTime);
            if (!base) continue;
            for (const col of headers) {
                if ((current[col] || 0) === 0) {
                    current[col] = base[col];
                }
            }
        }
    }

    const output = [];
    for (const [time, values] of Array.from(tempMap.entries()).sort()) {
        output.push({
            Time: time,
            ...values
        });
    }

    return { output, headers: ['Time', ...headers] };
}

(async function main() {
    try {
        const rows = await loadJSON(inputJsonFile);
        const { output, headers } = processData(rows);
        await saveCSV(output, headers, outputCsvFile);
        await saveJSON(output, outputJsonFile);
        console.log(`✅ CSV saved to ${outputCsvFile}`);
        console.log(`✅ JSON saved to ${outputJsonFile}`);
    } catch (error) {
        console.error('❌ Error processing data:', error);
    }
})();


/*
// Import necessary Node.js modules
const fs = require('fs');
const path = require('path');

// Import external library for CSV writing
// Make sure you have installed this: npm install csv-writer moment
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const moment = require('moment'); // Assuming moment is already installed based on original code

// --- Configuration ---
// Change input file to a JSON file
const inputJsonFilePath = path.join(__dirname, 'data/all-station-dates/output_sorted.json'); // Replace with your input JSON file name
const outputJsonFilePath = path.join(__dirname, 'data/all-station-dates/combined.json');
const outputCsvFilePath = path.join(__dirname, 'data/all-station-dates/combined.csv');

// --- Helper Function: Round time to nearest 15 minutes ---
function roundToNearest15(dateString, timeString) {
    // Combine date and time strings and parse using moment
    const dateTimeString = `${dateString} ${timeString}`;
    const formatString = "YYYY-MM-DD HH:mm"; // Assuming input time is HH:mm
    const m = moment(dateTimeString, formatString);

    // Calculate the nearest 15-minute interval
    const minutes = Math.round(m.minutes() / 15) * 15;

    // Adjust hour if rounding up to 60 minutes
    if (minutes === 60) {
        m.add(1, 'hour').startOf('hour');
    } else {
        // Set minutes and clear seconds/milliseconds
        m.minutes(minutes).seconds(0).milliseconds(0);
    }

    // Return formatted UTC timestamp
    return m.utc().format('YYYY-MM-DDTHH:mm:00[Z]');
}

// --- Function to Load Data from JSON ---
function loadJSON(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading JSON file ${filePath}:`, err);
                return reject(err);
            }
            try {
                const jsonData = JSON.parse(data);
                console.log(`Successfully loaded JSON file: ${filePath}`);
                resolve(jsonData);
            } catch (parseErr) {
                console.error(`Error parsing JSON file ${filePath}:`, parseErr);
                reject(parseErr);
            }
        });
    });
}

// --- Function to Save Data to JSON ---
function saveJSON(data, outputPath) {
    return new Promise((resolve, reject) => {
        // Ensure the output directory exists
        const outputDir = path.dirname(outputPath);
        fs.mkdir(outputDir, { recursive: true }, (err) => {
            if (err) {
                console.error(`Error creating output directory ${outputDir}:`, err);
                return reject(err);
            }

            fs.writeFile(outputPath, JSON.stringify(data, null, 2), 'utf8', (err) => {
                if (err) {
                    console.error(`Error writing JSON file ${outputPath}:`, err);
                    reject(err);
                } else {
                    console.log(`Successfully saved JSON file: ${outputPath}`);
                    resolve();
                }
            });
        });
    });
}

// --- Function to Save Data to CSV ---
function saveCSV(data, headers, outputPath) {
    // Ensure the output directory exists
    const outputDir = path.dirname(outputPath);
    fs.mkdirSync(outputDir, { recursive: true }); // Use sync for simplicity here, or handle async mkdir

    const csvWriter = createCsvWriter({
        path: outputPath,
        // Map headers to the correct format for csv-writer
        header: headers.map((h) => ({ id: h, title: h }))
    });

    console.log(`Saving data to CSV file: ${outputPath}`);
    return csvWriter.writeRecords(data);
}

// --- Function to Process Data (Aggregates and Fills Gaps) ---
function processData(rows) {
    const tempMap = new Map();
    let headers = [];

    console.log('Processing data...');

    // First pass: Aggregate data by rounding time and taking the max value
    for (const row of rows) {
        // Ensure Date and Time columns exist before processing
        if (!row.Date || !row.Time) {
            console.warn('Skipping row due to missing Date or Time:', row);
            continue;
        }

        const timeKey = roundToNearest15(row.Date, row.Time);
        const entry = tempMap.get(timeKey) || {};

        // Determine headers dynamically from the first row (excluding Date/Time/Timestamp)
        if (headers.length === 0) {
             headers = Object.keys(row).filter(h => h !== 'Date' && h !== 'Time' && h !== 'Timestamp');
             console.log('Identified data headers:', headers);
        }

        // Aggregate data for each header column, taking the maximum value
        for (const col of headers) {
            const currentVal = parseFloat(entry[col] || 0); // Use 0 if value is missing or not a number
            const newVal = parseFloat(row[col] || 0);
            entry[col] = Math.max(currentVal, newVal);
        }

        tempMap.set(timeKey, entry);
    }

    console.log('Aggregation complete. Filling gaps...');

    // Second pass: Fill 15/30/45 minute entries with value from 00 if their value is zero
    const sortedTimes = Array.from(tempMap.keys()).sort(); // Sort keys to process chronologically
    for (const time of sortedTimes) {
        const minute = moment(time).minutes();
        // Check if the minute is 15, 30, or 45
        if ([15, 30, 45].includes(minute)) {
            // Get the timestamp for the start of the hour (the '00' minute)
            const baseTime = moment(time).minutes(0).utc().format('YYYY-MM-DDTHH:mm:00[Z]');
            const current = tempMap.get(time);
            const base = tempMap.get(baseTime);

            // If the base time entry doesn't exist, we can't fill from it
            if (!base) continue;

            // For each data column, if the current entry's value is 0, use the base entry's value
            for (const col of headers) {
                 // Check if the current value is approximately zero (due to floating point) or exactly zero
                if (Math.abs(current[col] || 0) < 1e-9) { // Use a small tolerance for floating point comparison
                    current[col] = base[col];
                }
            }
        }
    }
     console.log('Gap filling complete.');


    // Convert the map back to an array of objects for output
    const output = [];
    // Sort entries by time key before converting to array
    const sortedEntries = Array.from(tempMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

    for (const [time, values] of sortedEntries) {
        output.push({
            Time: time, // Add the 'Time' column (which is the rounded timestamp)
            ...values // Spread the aggregated data values
        });
    }

    // Return the processed data array and the final headers (including 'Time')
    return { output, headers: ['Time', ...headers] };
}

// --- Main execution function ---
(async function main() {
    try {
        console.log(`Starting data processing...`);

        // 1. Load data from the JSON file
        const rows = await loadJSON(inputJsonFilePath);
        console.log(`Loaded ${rows.length} records from JSON.`);

        // 2. Process the loaded data
        const { output, headers } = processData(rows);
        console.log(`Processed data resulted in ${output.length} records.`);

        // 3. Save the processed data to a new JSON file
        await saveJSON(output, outputJsonFilePath);
        console.log(`Processed data saved to JSON: ${outputJsonFilePath}`);

        // 4. Save the processed data to a new CSV file
        if (headers.length > 1) { // Ensure there are headers other than just 'Time'
             await saveCSV(output, headers, outputCsvFilePath);
             console.log(`Processed data saved to CSV: ${outputCsvFilePath}`);
        } else {
             console.warn('No data columns found other than Time. Skipping CSV save.');
        }


    } catch (error) {
        console.error('An error occurred during processing:', error);
    }
})();

*/