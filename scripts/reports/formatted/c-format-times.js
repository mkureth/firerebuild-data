const fs = require('fs');
const path = require('path');
const moment = require('moment');
//const moment = require('moment-timezone');

const inputFilePath = '../../../data/REPORTS/formatted/reports/prep.json';
const rawData = fs.readFileSync(inputFilePath);
const inputData = JSON.parse(rawData);

const inputFilePathSCE = '../../../data/PROCESSED/sce/sce/sce-data.json';
const rawDataSCE = fs.readFileSync(inputFilePathSCE);
const inputDataSCE = JSON.parse(rawDataSCE);


inputData.forEach((entry, index) => {
    
    const dateString = entry.Date + ' ' + entry.Time;  //"2025-01-06 01:53";
    const momentDate = moment(dateString, "YYYY-MM-DD HH:mm");
    const roundedSpecificTime = roundToNearest15Minutes( momentDate.clone() ); // Use .clone() to avoid modifying the original
    entry["Rounded Date"] = roundedSpecificTime.format("YYYY-MM-DD HH:mm");

    if (index > 0) {
        if (inputData[index - 1]["Rounded Date"] == entry["Rounded Date"]) {
            inputData[index] = Object.assign({}, inputData[index - 1], entry);
        }
    }

});

//merge SCE date data
var sceData = {};
inputDataSCE.forEach((entry, index) => {
    const momentDate = moment(entry.date, "YYYY-MM-DD HH:mm");
    const sceDate = momentDate.format("YYYY-MM-DD HH:mm");

    sceData[sceDate] = sceData[sceDate] || {};
    sceData[sceDate].PGE = sceData[sceDate].PGE || entry.PGE;
    sceData[sceDate].SDGE = sceData[sceDate].SDGE || entry.SDGE;
    sceData[sceDate].SCE = sceData[sceDate].SCE || entry.SCE;
});



var paddedData = [];
inputData.forEach((entry, index) => {

    var includeData = true;
    if (index > 0) {
        if (inputData[index - 1]["Rounded Date"] == entry["Rounded Date"]) {
            includeData = false;
        } else {
            //pad by 15 minutes
            const previousDate  = moment(   inputData[index - 1]["Rounded Date"],  "YYYY-MM-DD HH:mm");
            const currentDate   = moment(   entry["Rounded Date"],                 "YYYY-MM-DD HH:mm");
            const differenceInMinutes = currentDate.diff(previousDate, 'minutes');

            //amount to duplicate
            const duplicateAmount = differenceInMinutes / 15;
            for (var i=1; i<duplicateAmount; i++) {
                const entryNew = { ...entry };
                const incrementedDate = previousDate.add(15, 'minutes');
                entryNew["Rounded Date"] = incrementedDate.format("YYYY-MM-DD HH:mm");
                paddedData.push(entryNew);
            }
        }
    }

    if (includeData) {
        paddedData.push(entry);
    }
});


const output = [];
paddedData.forEach((entry, index) => {

    const dateToCheck = moment(entry.Date);
    const startDate = moment('2025-01-05');
    const endDate = moment('2025-01-11');
    const isBetweenInclusive = dateToCheck.isBetween(startDate, endDate, null, '[]');

    const roundedDate = entry["Rounded Date"];
    var sce_PGE = 0;
    var sce_SDGE = 0;
    var sce_SCE = 0;

    if ( sceData[roundedDate] ) {
        sce_PGE = sceData[roundedDate].PGE || 0;
        sce_SDGE = sceData[roundedDate].SDGE || 0;
        sce_SCE = sceData[roundedDate].SCE || 0;
    }

    const tempData = {
        "Rounded Date":             entry["Rounded Date"] || null,
        "Temperature":              entry["Temperature"] || null,
        "Dew Point":                entry["Dew Point"] || null,
        "Humidity":                 entry["Humidity"] || null,
        "Wind":                     entry["Wind"] || null,
        "Wind Speed":               entry["Wind Speed"] || null,
        "Wind Gust":                entry["Wind Gust"] || null,
        "Pressure":                 entry["Pressure"] || null,
        "Condition":                entry["Condition"] || null,
        "Precipitation":            entry["Precipitation"] || null,
        "Display Date":             entry["Display Date"] || null,
        "Size":                     entry["Size"] || 0,
        "Containment":              entry["Containment"] || "0%",
        "Structures Threatened":    entry["Structures Threatened"] || 0,
        "Structures Destroyed":     entry["Structures Destroyed"] || 0,
        "Civilian Injuries":        entry["Civilian Injuries"] || 0,
        "Civilian Fatalities":      entry["Civilian Fatalities"] || 0,
        "Structures Damaged":       entry["Structures Damaged"] || 0,
        "Firefighter Injuries":     entry["Firefighter Injuries"] || 0,
        "SCE PGE":                  sce_PGE,
        "SCE SDGE":                 sce_SDGE,
        "SCE SCE":                  sce_SCE,
        "Source Weather":           entry["Source Weather"],
        "Source Fire CA":           entry["Source Fire CA"]
    };

    //if (isBetweenInclusive) {
        output.push(tempData);
    //}

    
    /*
    output.xData.push(entry.Date);

    output.datasets[0].data.push( Number(entry.Temperature) || 0);
    output.datasets[1].data.push( Number(entry["Wind Speed"]) || 0);
    output.datasets[2].data.push( parseNumber(entry["Size"]) );
    
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

const outputFilePath = '../../../data/REPORTS/formatted/reports/times.json';
fs.writeFileSync(outputFilePath, JSON.stringify(output, null, 2));
//fs.writeFileSync(outputFilePath, JSON.stringify(output));

console.log('Conversion complete. Output saved to times.json');
