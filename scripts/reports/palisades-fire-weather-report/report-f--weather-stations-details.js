const fs = require('fs');
const path = require('path');
const moment = require('moment');

const inputFilePath = '../../../deploy/content/palisades-fire-weather-report/reports/weather-stations-details/files/stations.json';
const rawData = fs.readFileSync(inputFilePath);
let inputData = JSON.parse(rawData); // Use let as we will reassign after sorting

const output = {
    dataTable: {
        columns: {
            "Station": [],
            "Name": [],
            "Address": [],
            "Lat": [],
            "Lng": [],
            "Fire": [],
            "KCATOPAN": [],
            "KLAX": [],
            "Anomaly": [],
        }
    }
};

inputData.forEach(entry => {
    //if (excludeStations.indexOf(entry.stationCode) === -1) {
        output.dataTable.columns["Station"].push( checkSource(entry.StationCode) );
        output.dataTable.columns["Name"].push( entry['StationName'] );
        output.dataTable.columns["Address"].push( entry['StationFullAddress'] );
        output.dataTable.columns["Lat"].push( entry['Lat'] );
        output.dataTable.columns["Lng"].push( entry['Lng'] );
        output.dataTable.columns["Fire"].push( stringToNumber(entry['FireDistanceMiles']) );
        output.dataTable.columns["KCATOPAN"].push( stringToNumber(entry['KCATOPANDistanceMiles']) );
        output.dataTable.columns["KLAX"].push( stringToNumber(entry['KLAXDistanceMiles']) );
        output.dataTable.columns["Anomaly"].push( entry['Anomaly'] );
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

function stringToNumber(str) {
    return Number(str);
}



function checkSource(station) {
    var displayFormat = '<a href="https://firerebuild.com/content/palisades-fire-weather-report/reports/highest-wind-speed-analysis/files/stations/' + station + '.csv" target="_blank">' + station + '</a>';
    return displayFormat;
}

const outputFilePath = '../../../deploy/content/palisades-fire-weather-report/reports/weather-stations-details/data/weather-stations-details.json'

// Use null, 2 for pretty printing
fs.writeFileSync(outputFilePath, JSON.stringify(output));

console.log('Conversion complete. Output saved to cal-fire-reports.json');