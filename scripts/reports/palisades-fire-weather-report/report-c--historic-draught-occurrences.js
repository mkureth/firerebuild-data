const fs = require('fs');
const path = require('path');
const moment = require('moment');

const inputFilePath = '../../../deploy/content/palisades-fire-weather-report/assets/draught-occurrences.json';
const rawData = fs.readFileSync(inputFilePath);
let inputData = JSON.parse(rawData); // Use let as we will reassign after sorting

const output = {
    dataTable: {
        columns: {
            "Start Date": [],
            "End Date": [],
            "Days": []
        }
    }
};

//const excludeStations = ['KCASANTA630', 'KCALOSAN842', 'KCASANTA4733', 'KCATOPAN8'];
inputData.forEach(entry => {
    //if (excludeStations.indexOf(entry.stationCode) === -1) {
        output.dataTable.columns["Start Date"].push( entry.startDate );
        output.dataTable.columns["End Date"].push( entry.endDate );
        output.dataTable.columns["Days"].push( entry.length );
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

const outputFilePath = '../../../deploy/content/palisades-fire-weather-report/reports/historic-draught-occurrences/data/historic-draught-occurrences.json'

// Use null, 2 for pretty printing
fs.writeFileSync(outputFilePath, JSON.stringify(output));

console.log('Conversion complete. Output saved to historic-draught-occurrences.json');