const fs = require('fs');
const path = require('path');
//const moment = require('moment');
const moment = require('moment-timezone');

const inputFilePath = path.join('data/prep', 'prep.json');
const rawData = fs.readFileSync(inputFilePath);
const inputData = JSON.parse(rawData);

const output = {
    "xData": [],
    "datasets": [{
        "name": "Temperature",
        "data": [],
        "unit": "fahrenheit",
        "type": "line",
        "valueDecimals": 0
    }, {
        "name": "Wind Speed",
        "data": [],
        "unit": "mph",
        "type": "area",
        "valueDecimals": 0
    }, {
        "name": "Fire Size",
        "data": [],
        "unit": "acres",
        "type": "area",
        "valueDecimals": 0
    }]
};

var formattedData = [];
inputData.forEach((entry, index) => {

    const dateToCheck = moment(entry.Date);
    const startDate = moment('2025-01-05');
    const endDate = moment('2025-01-11');
    const isBetweenInclusive = dateToCheck.isBetween(startDate, endDate, null, '[]');
    if (isBetweenInclusive) {
        formattedData.push(entry);
    }

    //round time
    const specificDateTimeString = entry.Date + ' ' + entry.Time;
    const pacificTimeZone = 'America/Los_Angeles';
    const specificDateTime = moment.tz(specificDateTimeString, 'YYYY-MM-DD HH:mm:ss', pacificTimeZone);
    const roundedSpecificTime = roundToNearest15Minutes(specificDateTime); // Use .clone() to avoid modifying the original
    //console.log(`Rounded to nearest 15 minutes (Pacific): ${roundedSpecificTime.format('YYYY-MM-DD HH:mm z')}`);

});

formattedData.forEach((entry, index) => {
    
    output.xData.push(entry.Date);

    output.datasets[0].data.push( Number(entry.Temperature) || 0);
    output.datasets[1].data.push( Number(entry["Wind Speed"]) || 0);
    output.datasets[2].data.push( parseNumber(entry["Size"]) );
    /*
    output.dataTable.columns["Display Date"].push(entry["Display Date"] || null);

    output.dataTable.columns["Sort Date"].push(formatDate(entry.Date, entry.Time));

    output.dataTable.columns.Temperature.push(Number(entry.Temperature) || 0);
    output.dataTable.columns.Wind.push(entry.Wind) || '';
    output.dataTable.columns["Wind Speed"].push(Number(entry["Wind Speed"]) || 0);
    output.dataTable.columns["Wind Gust"].push(Number(entry["Wind Gust"]) || 0);

    output.dataTable.columns["Fire Size"].push(parseNumber(entry["Size"]));
    output.dataTable.columns.Containment.push(parsePercentage(entry.Containment));
    output.dataTable.columns["Structures Threatened"].push(parseNumber(entry["Structures Threatened"]));
    output.dataTable.columns["Structures Destroyed"].push(parseNumber(entry["Structures Destroyed"]));
    output.dataTable.columns["Structures Damaged"].push(parseNumber(entry["Structures Damaged"]));

    output.dataTable.columns["Data Source"].push(checkSource(entry["Source Fire CA"], entry["Source Weather"]));
    */
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

const outputFilePath = path.join('data/deploy', 'chart.json');
//fs.writeFileSync(outputFilePath, JSON.stringify(output, null, 2));
fs.writeFileSync(outputFilePath, JSON.stringify(output));

console.log('Conversion complete. Output saved to chart.json');
