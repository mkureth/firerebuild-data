const fs = require('fs');
const path = require('path');
const moment = require('moment');

const inputFilePath = '../../../deploy/content/palisades-fire-weather-report/assets/drought-occurrences.json';
const rawData = fs.readFileSync(inputFilePath);
let inputData = JSON.parse(rawData); // Use let as we will reassign after sorting

const output = {
    dataTable: {
        columns: {
            "Drought Start Date": [],
            "Drought End Date": [],
            "Drought Total Days": [],

            "Drought Total Precipitation": [],
            "Previous 180 Days Precipitation": [],

            "Rain Between Droughts Start": [],
            "Rain Between Droughts End": [],
            "Rain Total Days": [],
            "Rain Between Droughts": [],

        }
    }
};

//const excludeStations = ['KCASANTA630', 'KCALOSAN842', 'KCASANTA4733', 'KCATOPAN8'];
inputData.forEach(entry => {
    //if (excludeStations.indexOf(entry.stationCode) === -1) {
        output.dataTable.columns["Drought Start Date"].push( entry['startDate'] );
        output.dataTable.columns["Drought End Date"].push( entry['endDate'] );
        output.dataTable.columns["Drought Total Days"].push( entry['totalDays'] );

        output.dataTable.columns["Drought Total Precipitation"].push( Number(entry['totalPrecipitation']) );
        output.dataTable.columns["Previous 180 Days Precipitation"].push( Number(entry['previousPrecipitation']) );

        output.dataTable.columns["Rain Between Droughts Start"].push( entry['rainBetweenDroughtsRangeStart'] );
        output.dataTable.columns["Rain Between Droughts End"].push( entry['rainBetweenDroughtsRangeEnd'] );
        output.dataTable.columns["Rain Total Days"].push( entry['totalRainDays'] );
        output.dataTable.columns["Rain Between Droughts"].push( Number(entry['rainBetweenDroughts']) );

    //}
});

// This function is not used in the provided code but kept for completeness
function parsePercentage(str) {
    return str ? parseFloat(str.replace('%', '')) : 0;
}

// This function is not used in the provided code but kept for completeness
function parseNumber(str) {
    return str ? parseInt(str.replace(/,/g, '')) : 0;
}

const outputFilePath = '../../../deploy/content/palisades-fire-weather-report/reports/historic-drought-occurrences/data/historic-drought-occurrences.json'

// Use null, 2 for pretty printing
fs.writeFileSync(outputFilePath, JSON.stringify(output));

console.log('Conversion complete. Output saved to historic-drought-occurrences.json');