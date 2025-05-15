// Import necessary Node.js modules
const fs = require('fs');
const path = require('path');

// Import external libraries for CSV parsing and writing
// Make sure you have installed these: npm install csv-parser csv-writer
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// --- Configuration ---
const inputCsvFilePath = path.join(__dirname, 'data/all-station-headers/combined.csv'); // Replace with your input CSV file name
const outputJsonFilePath = path.join(__dirname, 'data/all-station-dates/output_sorted.json');
const outputCsvFilePath = path.join(__dirname, 'data/all-station-dates/output_sorted.csv');

// --- Script Logic ---

const results = [];
let csvHeaders = []; // To store headers for writing the new CSV

console.log(`Reading CSV file: ${inputCsvFilePath}`);

// Read the CSV file
fs.createReadStream(inputCsvFilePath)
  .pipe(csv())
  .on('headers', (headers) => {
    // Capture headers to use for writing the output CSV
    csvHeaders = headers.map(header => ({ id: header, title: header }));
    console.log('Detected headers:', headers);
  })
  .on('data', (data) => {
    // Push each row (as a JSON object) into the results array
    results.push(data);
  })
  .on('end', () => {
    console.log(`Finished reading CSV. Total rows: ${results.length}`);

    // --- Sort the data by Date and Time ---
    // Assuming 'Date' column is in YYYY-MM-DD format and 'Time' is in HH:mm:ss format
    console.log('Sorting data by Date and Time...');
    results.sort((a, b) => {
      // Combine Date and Time strings and parse them into Date objects for comparison
      const dateTimeA = new Date(`${a['Date']} ${a['Time']}`);
      const dateTimeB = new Date(`${b['Date']} ${b['Time']}`);

      // Compare the Date objects
      if (dateTimeA < dateTimeB) {
        return -1; // a comes before b
      }
      if (dateTimeA > dateTimeB) {
        return 1; // a comes after b
      }
      return 0; // Dates and times are equal
    });
    console.log('Sorting complete.');

    // --- Save sorted data as JSON ---
    console.log(`Saving sorted data to JSON file: ${outputJsonFilePath}`);
    fs.writeFile(outputJsonFilePath, JSON.stringify(results, null, 2), (err) => {
      if (err) {
        console.error('Error writing JSON file:', err);
      } else {
        console.log('Sorted data successfully saved as JSON.');
      }
    });

    // --- Save sorted data as CSV ---
    if (csvHeaders.length > 0) {
      console.log(`Saving sorted data to CSV file: ${outputCsvFilePath}`);
      const csvWriter = createCsvWriter({
        path: outputCsvFilePath,
        header: csvHeaders
      });

      csvWriter.writeRecords(results)
        .then(() => {
          console.log('Sorted data successfully saved as CSV.');
        })
        .catch((err) => {
          console.error('Error writing CSV file:', err);
        });
    } else {
      console.warn('No headers found in the input CSV. Cannot write output CSV.');
    }
  })
  .on('error', (err) => {
    console.error('Error reading CSV file:', err);
  });

