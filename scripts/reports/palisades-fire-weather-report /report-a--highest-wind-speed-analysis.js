const fs = require('fs');
const path = require('path');
const moment = require('moment');

const inputFilePath = '../../../deploy/content/palisades-fire-weather-report/assets/summary.json';
const rawData = fs.readFileSync(inputFilePath);
let inputData = JSON.parse(rawData); // Use let as we will reassign after sorting

const output = {
    dataTable: {
        columns: {
            "Station": [],
            "Wind Speed High": [],
            "Wind Gust High": [],
            "Wind Speed Time": [],
            "Wind Gust Time": [],
            "Distance": []
        }
    }
};

// Sort inputData by Date ascending
inputData.sort((a, b) => {
    const dateA = moment(a.maxWindSpeedTime);
    const dateB = moment(b.maxWindSpeedTime);
    if (dateA.isBefore(dateB)) {
        return -1;
    }
    if (dateA.isAfter(dateB)) {
        return 1;
    }
    return 0; // Dates are equal
});

const excludeStations = ['KCASANTA630', 'KCALOSAN842', 'KCASANTA4733', 'KCATOPAN8'];
inputData.forEach(entry => {
    if (excludeStations.indexOf(entry.stationCode) === -1) {
        output.dataTable.columns["Station"].push( checkSource(entry.stationCode) );
        
        output.dataTable.columns["Wind Speed Time"].push( entry.maxWindSpeedTime );
        output.dataTable.columns["Wind Speed High"].push( entry.maxWindSpeedHigh );

        output.dataTable.columns["Wind Gust High"].push( entry.maxWindGustHigh );
        output.dataTable.columns["Wind Gust Time"].push( entry.maxWindGustTime );

        output.dataTable.columns["Distance"].push( entry.fireDistanceMiles );
    }
});

// This function is not used in the provided code but kept for completeness
function parsePercentage(str) {
    return str ? parseFloat(str.replace('%', '')) : 0;
}

function checkSource(station) {
    // Note: The original code hardcoded the date to '2025-01-07'.
    // If you intend to use the date from the entry, uncomment the line below:
    //var weather = datetime.split('T')[0]; // Use date from entry
    var weather = '2025-01-07'; // Original hardcoded date

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

const outputFilePath = '../../../deploy/content/palisades-fire-weather-report/reports/highest-wind-speed-analysis/data/highest-wind-speed-analysis.json';

// Use null, 2 for pretty printing
fs.writeFileSync(outputFilePath, JSON.stringify(output));

console.log('Conversion complete. Output saved to highest-wind-speed-analysis.json');