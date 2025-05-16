const fs = require('fs');
const path = require('path');
const moment = require('moment');

const inputFilePath = path.join('data/all-merged', 'final-combined-report.json');
const rawData = fs.readFileSync(inputFilePath);
let inputData = JSON.parse(rawData); // Use let as we will reassign after sorting

const output = {
    dataTable: {
        columns: {
            "Date": [],
            "Station Wind Speed High": [],
            "Wind Speed High": [],
            "Station Wind Gust High": [],
            "Wind Gust High": []
        }
    },
    rendering: {
        theme: 'hcg-theme-default theme-compact',
        rows: {
            strictHeights: true,
        },
    }
};

// Sort inputData by Date ascending
inputData.sort((a, b) => {
    const dateA = moment(a.DateTime);
    const dateB = moment(b.DateTime);
    if (dateA.isBefore(dateB)) {
        return -1;
    }
    if (dateA.isAfter(dateB)) {
        return 1;
    }
    return 0; // Dates are equal
});

inputData.forEach(entry => {
    output.dataTable.columns["Date"].push(entry.DateTime);
    output.dataTable.columns["Station Wind Speed High"].push( checkSource(entry.DateTime, entry["Station Wind Speed High"]) );

    // Assign "Wind Speed High" as a number
    const windSpeedHigh = parseFloat(entry["Wind Speed High"]);
    // Push the number, or null if parsing fails
    output.dataTable.columns["Wind Speed High"].push(isNaN(windSpeedHigh) ? null : windSpeedHigh);

    output.dataTable.columns["Station Wind Gust High"].push( checkSource(entry.DateTime, entry["Station Wind Gust High"]) );

    // Assign "Wind Gust High" as a number
    const windGustHigh = parseFloat(entry["Wind Gust High"]);
    // Push the number, or null if parsing fails
    output.dataTable.columns["Wind Gust High"].push(isNaN(windGustHigh) ? null : windGustHigh);
});

// This function is not used in the provided code but kept for completeness
function parsePercentage(str) {
    return str ? parseFloat(str.replace('%', '')) : 0;
}

function checkSource(datetime, station) {
    // Note: The original code hardcoded the date to '2025-01-07'.
    // If you intend to use the date from the entry, uncomment the line below:
    var weather = datetime.split('T')[0]; // Use date from entry
    // var weather = '2025-01-07'; // Original hardcoded date

    var displayFormat;

    // Assuming station length is used to differentiate between PWS and official stations
    if (station && typeof station === 'string' && station.length > 4) {
        displayFormat = '<a href="https://www.wunderground.com/dashboard/pws/' + station + '/table/' + weather + '/' + weather + '/daily" target="_blank">' + station + '</a>';
    } else if (station && typeof station === 'string') {
        displayFormat = '<a href="https://www.wunderground.com/history/daily/us/ca/los-angeles/' + station + '/date/' + weather + '" target="_blank">' + station + '</a>';
    } else {
        displayFormat = station; // Handle cases where station might not be a valid string
    }

    return displayFormat;
}

// This function is not used in the provided code but kept for completeness
function parseNumber(str) {
    return str ? parseInt(str.replace(/,/g, '')) : 0;
}

const outputFilePath = path.join('data/deploy', 'grid-wind-stations.json');
// Use null, 2 for pretty printing
fs.writeFileSync(outputFilePath, JSON.stringify(output));

console.log('Conversion complete. Output saved to grid-wind-stations.json');