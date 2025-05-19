const fs = require('fs');
const path = require('path');
const moment = require('moment');

//http://localhost:3000/assets/content/embed/grid-daily/embed.html?env=local

const inputFilePath = path.join('data/raw', 'weather-daily-stations.json');
const rawData = fs.readFileSync(inputFilePath);
const inputData = JSON.parse(rawData);

const output = {
    dataTable: {
        columns: {
            "Date": [],

            "KCAMALIB62_s": [],
            "KCAMALIB62_g": [],

            "KCAPACIF132_s": [],
            "KCAPACIF132_g": [],

            "KCAMALIB87_s": [],
            "KCAMALIB87_g": [],

            "KCAPACIF208_s": [],
            "KCAPACIF208_g": [],

            "KCALOSAN958_s": [],
            "KCALOSAN958_g": [],

            "KCAPACIF227_s": [],
            "KCAPACIF227_g": [],

            "KCAPACIF287_s": [],
            "KCAPACIF287_g": [],

            "KCAMALIB133_s": [],
            "KCAMALIB133_g": [],

            "KCAPACIF320_s": [],
            "KCAPACIF320_g": []
        }

    },
    rendering: {
        theme: 'hcg-theme-default theme-compact',
        rows: {
            strictHeights: true,
        },
    },
    header: [
        'Date',
        {
            format: 'KCALOSAN958',
            columns: [{
                columnId: 'KCALOSAN958_s',
                format: 'Speed'
            }, {
                columnId: 'KCALOSAN958_g',
                format: 'Gust'
            }]
        }, {
            format: 'KCAMALIB62',
            columns: [{
                columnId: 'KCAMALIB62_s',
                format: 'Speed'
            }, {
                columnId: 'KCAMALIB62_g',
                format: 'Gust'
            }]
        }, {
            format: 'KCAMALIB87',
            columns: [{
                columnId: 'KCAMALIB87_s',
                format: 'Speed'
            }, {
                columnId: 'KCAMALIB87_g',
                format: 'Gust'
            }]
        }, {
            format: 'KCAMALIB133',
            columns: [{
                columnId: 'KCAMALIB133_s',
                format: 'Speed'
            }, {
                columnId: 'KCAMALIB133_g',
                format: 'Gust'
            }]
        }, {
            format: 'KCAPACIF287',
            columns: [{
                columnId: 'KCAPACIF287_s',
                format: 'Speed'
            }, {
                columnId: 'KCAPACIF287_g',
                format: 'Gust'
            }]
        }
    ]
};

            /*
        }, {
            format: 'KCAPACIF227',
            columns: [{
                columnId: 'KCAPACIF227_s',
                format: 'Speed'
            }, {
                columnId: 'KCAPACIF227_g',
                format: 'Gust'
            }]

        }, {
            format: 'KCAPACIF208',
            columns: [{
                columnId: 'KCAPACIF208_s',
                format: 'Speed'
            }, {
                columnId: 'KCAPACIF208_g',
                format: 'Gust'
            }]
        }, {
            format: 'KCAPACIF132',
            columns: [{
                columnId: 'KCAPACIF132_s',
                format: 'Speed'
            }, {
                columnId: 'KCAPACIF132_g',
                format: 'Gust'
            }]
        }, {
            format: 'KCAPACIF320',
            columns: [{
                columnId: 'KCAPACIF320_s',
                format: 'Speed'
            }, {
                columnId: 'KCAPACIF320_g',
                format: 'Gust'
            }]

            */

/*

No Data:
    KCAPACIF320_s
    KCAPACIF227_g
    KCAPACIF208_g
    KCAPACIF132_g
*/



inputData.forEach(entry => {

    const isValidDate = isDateBetween(entry.date, '2025-01-07', '2025-01-09');
    if (isValidDate) {
        output.dataTable.columns["Date"].push( entry.date );

        output.dataTable.columns["KCAMALIB62_s"].push(Number(entry["KCAMALIB62_s"]) || 0);
        output.dataTable.columns["KCAMALIB62_g"].push(Number(entry["KCAMALIB62_g"]) || 0);

/*
        output.dataTable.columns["KCAPACIF132_s"].push(Number(entry["KCAPACIF132_s"]) || 0);
        output.dataTable.columns["KCAPACIF132_g"].push(Number(entry["KCAPACIF132_g"]) || 0);
*/
        output.dataTable.columns["KCAMALIB87_s"].push(Number(entry["KCAMALIB87_s"]) || 0);
        output.dataTable.columns["KCAMALIB87_g"].push(Number(entry["KCAMALIB87_g"]) || 0);

/*
        output.dataTable.columns["KCAPACIF208_s"].push(Number(entry["KCAPACIF208_s"]) || 0);
        output.dataTable.columns["KCAPACIF208_g"].push(Number(entry["KCAPACIF208_g"]) || 0);
*/

        output.dataTable.columns["KCALOSAN958_s"].push(Number(entry["KCALOSAN958_s"]) || 0);
        output.dataTable.columns["KCALOSAN958_g"].push(Number(entry["KCALOSAN958_g"]) || 0);
/*
        output.dataTable.columns["KCAPACIF227_s"].push(Number(entry["KCAPACIF227_s"]) || 0);
        output.dataTable.columns["KCAPACIF227_g"].push(Number(entry["KCAPACIF227_g"]) || 0);
*/
        output.dataTable.columns["KCAPACIF287_s"].push(Number(entry["KCAPACIF287_s"]) || 0);
        output.dataTable.columns["KCAPACIF287_g"].push(Number(entry["KCAPACIF287_g"]) || 0);

        output.dataTable.columns["KCAMALIB133_s"].push(Number(entry["KCAMALIB133_s"]) || 0);
        output.dataTable.columns["KCAMALIB133_g"].push(Number(entry["KCAMALIB133_g"]) || 0);
/*
        output.dataTable.columns["KCAPACIF320_s"].push(Number(entry["KCAPACIF320_s"]) || 0);
        output.dataTable.columns["KCAPACIF320_g"].push(Number(entry["KCAPACIF320_g"]) || 0);
*/
    }
});


function isDateBetween(dateToCheck, startDate, endDate) {
  const checkMoment = moment(dateToCheck);
  const startMoment = moment(startDate);
  const endMoment = moment(endDate);
  if (!checkMoment.isValid() || !startMoment.isValid() || !endMoment.isValid()) {
    console.error("One or more input dates are invalid.");
    return false; // Return false for invalid dates
  }
  return checkMoment.isBetween(startMoment, endMoment, 'day', '[]'); // Use '[]' for inclusive
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
    const momentDate = moment(date + ' ' + time, "YYYY-MM-DD HH:mm");
    return  momentDate.format('YYYY-MM-DDTHH:mm:ss[Z]');
}

const outputFilePath = path.join('data/deploy', 'grid-daily-stations.json');
fs.writeFileSync(outputFilePath, JSON.stringify(output));

console.log('Conversion complete. Output saved to grid.json');
