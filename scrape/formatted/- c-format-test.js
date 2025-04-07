const fs = require('fs');
const path = require('path');
const moment = require('moment');
//const moment = require('moment-timezone');

const inputFilePath = path.join('data/prep', 'weather.json');
const rawData = fs.readFileSync(inputFilePath);
const inputData = JSON.parse(rawData);


inputData.properties.timeseries.forEach((entry, index) => {
    //console.log(entry.data.instant.details);
    //entry.data.instant.details

    ['next_1_hours', 'next_6_hours', 'next_12_hours'].forEach(period => {
        const periodData = entry.data[period];
        if (!periodData) return;

        const symbolCode = periodData.summary?.symbol_code;
        const precipitationAmount = periodData.details?.precipitation_amount;

        if (symbolCode) {
            entry.data.instant.details.symbol_code = symbolCode;
        }

        if (precipitationAmount !== undefined) {
            entry.data.instant.details.precipitation_amount = precipitationAmount;
        }
    });

    delete entry.data.next_1_hours;
    delete entry.data.next_6_hours;
    delete entry.data.next_12_hours;

});

inputData.properties.timeseries.forEach((entry, index) => {
    entry.data = entry.data.instant.details;
});



function roundToNearest15Minutes(momentDate) {
  const minutes = momentDate.minutes();
  const remainder = minutes % 15;

  if (remainder >= 8) {
    momentDate.add(15 - remainder, 'minutes');
  } else {
    momentDate.subtract(remainder, 'minutes');
  }

  momentDate.seconds(0);
  momentDate.milliseconds(0);

  return momentDate;
}


function parsePercentage(str) {
  return str ? parseFloat(str.replace('%', '')) : 0;
}

function checkSource(fire, weather) {
    var displayFormat = '';
    if (weather) {
        displayFormat = '<a href="https://www.wunderground.com/history/daily/us/ca/los-angeles/KLAX/date/' + weather + '" target="_blank">Weather Source</a>';
    }
    if (fire) {
        displayFormat = '<a href="https://www.fire.ca.gov/incidents/2025/1/7/palisades-fire/updates/' + fire + '" target="_blank">Fire Source</a>';
    }
    return displayFormat;
}

function parseNumber(str) {
    return str ? parseInt(str.replace(/,/g, '')) : 0;
    //return str ? str : 0;
}

function formatDate(date, time) {
    return date;
}

const outputFilePath = path.join('data/deploy', 'data.json');
fs.writeFileSync(outputFilePath, JSON.stringify(inputData, null, 2));
//fs.writeFileSync(outputFilePath, JSON.stringify(output));

console.log('Conversion complete. Output saved to data.json');
