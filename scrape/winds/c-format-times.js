const fs = require('fs');
const path = require('path');
const moment = require('moment');

const inputFilePath = path.join('data/prep', 'prep.json');
const rawData = fs.readFileSync(inputFilePath);
const inputData = JSON.parse(rawData);

inputData.forEach((entry, index) => {

    const momentDate = moment(entry.date, "MM-DD-YYYY");
    entry["date"] = momentDate.format("YYYY-MM-DD");
});

const output = [];
inputData.forEach((entry, index) => {

    
    const momentDate = moment(entry.date, "YYYY-MM-DD");
    const formattedDate = momentDate.format("YYYY-M");

    //function checkSource(formattedDate);

    const tempData = {
        "date":                 entry["date"] || null,
        "temperature_max":      entry["temperature_max"] || null,
        "temperature_avg":      entry["temperature_avg"] || null,
        "temperature_min":      entry["temperature_min"] || null,
        "wind_speed_max":       entry["wind_speed_max"] || null,
        "wind_speed_avg":       entry["wind_speed_avg"] || null,
        "wind_speed_min":       entry["wind_speed_min"] || null,
        "source":               formattedDate || null
    };

    //if (isBetweenInclusive) {
        output.push(tempData);
    //}
});

function parsePercentage(str) {
  return str ? parseFloat(str.replace('%', '')) : 0;
}

function checkSource(weather) {
    var displayFormat = '<a href="https://www.wunderground.com/history/monthly/us/ca/los-angeles/KLAX/date/' + weather + '" target="_blank">Weather Source</a>';
    return displayFormat;
}

function parseNumber(str) {
    return str ? parseInt(str.replace(/,/g, '')) : 0;
    //return str ? str : 0;
}

function formatDate(date, time) {
    return date;
}

const outputFilePath = path.join('data/prep', 'times.json');
fs.writeFileSync(outputFilePath, JSON.stringify(output, null, 2));
//fs.writeFileSync(outputFilePath, JSON.stringify(output));

console.log('Conversion complete. Output saved to times.json');
