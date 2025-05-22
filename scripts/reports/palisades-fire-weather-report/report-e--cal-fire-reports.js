const fs = require('fs');
const path = require('path');
const moment = require('moment');

const inputFilePath = '../../../deploy/content/palisades-fire-weather-report/reports/cal-fire-reports/files/cal-fire-reports.json';
const rawData = fs.readFileSync(inputFilePath);
let inputData = JSON.parse(rawData); // Use let as we will reassign after sorting

const output = {
    dataTable: {
        columns: {
            "DateTime": [],
            "Size": [],
            "Source": [],
            "Containment": [],
            "Structures Threatened": [],
            "Structures Destroyed": [],
            "Civilian Injuries": [],
            "Civilian Fatalities": [],
            "Structures Damaged": [],
            "Firefighter Injuries": [],
            "Firefighter Fatalities": []
        }
    }
};

inputData.forEach(entry => {
    //if (excludeStations.indexOf(entry.stationCode) === -1) {
        output.dataTable.columns["DateTime"].push( entry.DateTime );
        output.dataTable.columns["Size"].push( parseNumber(entry['Size']) );
        output.dataTable.columns["Source"].push( checkSource(entry['guid']) );
        output.dataTable.columns["Containment"].push( parsePercentage(entry['Containment']) );
        output.dataTable.columns["Structures Threatened"].push( parseNumber(entry['Structures Threatened']) );
        output.dataTable.columns["Structures Destroyed"].push( parseNumber(entry['Structures Destroyed']) );
        output.dataTable.columns["Civilian Injuries"].push( parseNumber(entry['Civilian Injuries']) );
        output.dataTable.columns["Civilian Fatalities"].push( parseNumber(entry['Civilian Fatalities']) );
        output.dataTable.columns["Structures Damaged"].push( parseNumber(entry['Structures Damaged']) );
        output.dataTable.columns["Firefighter Injuries"].push( parseNumber(entry['Firefighter Injuries']) );
        output.dataTable.columns["Firefighter Fatalities"].push( 0 );
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

function checkSource(fire) {
    var displayFormat = '<a href="https://www.fire.ca.gov/incidents/2025/1/7/palisades-fire/updates/' + fire + '" target="_blank">Source</a>';
    return displayFormat;
}

const outputFilePath = '../../../deploy/content/palisades-fire-weather-report/reports/cal-fire-reports/data/cal-fire-reports.json'

// Use null, 2 for pretty printing
fs.writeFileSync(outputFilePath, JSON.stringify(output));

console.log('Conversion complete. Output saved to cal-fire-reports.json');