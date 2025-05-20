const fs = require('fs');
const path = require('path');
const moment = require('moment');

const inputFilePath = '../../data/REPORTS/formatted/reports/times.json';
const rawData = fs.readFileSync(inputFilePath);
const inputData = JSON.parse(rawData);

const output = {
    dataTable: {
        columns: {
            "Date": [],

            Temperature: [],
            Wind: [],
            "Wind Speed": [],
            "Wind Gust": [],

            "Fire Size": [],
            Containment: [],
            "Structures Threatened": [],
            "Structures Destroyed": [],
            "Structures Damaged": [],

            "SCE": [],

            "Data Source": []
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
            format: 'Weather Data from api.weather.com',
            columns: [{
                columnId: 'Temperature',
                format: 'Temperature'
            }, {
                columnId: 'Wind',
                format: 'Wind'
            }, {
                columnId: 'Wind Speed',
                format: 'Wind Speed'
            }, {
                columnId: 'Wind Gust',
                format: 'Wind Gust'
            }]
        }, {
            format: 'Fire Data from fire.ca.gov',
            columns: [{
                columnId: 'Fire Size',
                format: 'Fire Size'
            }, {
                columnId: 'Containment',
                format: 'Containment'
            }, {
                columnId: 'Structures Threatened',
                format: 'Structures Threatened'
            }, {
                columnId: 'Structures Destroyed',
                format: 'Structures Destroyed'
            }, {
                columnId: 'Structures Damaged',
                format: 'Structures Damaged'
            }]

        }, {
            format: 'SCE Customers De-Energized',
            columns: [{
                columnId: 'SCE',
                format: 'SCE Power Outage'
            }]

        },
        'Data Source'
    ],

    columns: [{
        id: 'Date',
        header: {
            format: 'Date'
        }
    }, {
        id: 'Sort Date',
        cells: {
            format: 'test {value}'
        }
    }, {
        id: 'Temperature',
        cells: {
            format: '{value} °F'
        }
    }, {
        id: 'Wind Speed',
        cells: {
            format: '{value} mph'
        }
    }, {
        id: 'Wind Gust',
        cells: {
            format: '{value} mph'
        }
    }, {
        id: 'Fire Size',
        cells: {
            formatter: function () {
                return 'acres';
            }
        }
    }, {
        id: 'Containment',
        cells: {
            format: '{value}%'
        }
    }],
    caption: {
        text: 'Weather and Fire Data from the 2025 Palisades Fire'
    },
    description: {
        text: 'Weather and Fire Data is provided by https://weather.com and https://www.fire.ca.gov'
    }
};

inputData.forEach(entry => {

    //output.dataTable.columns["Date"].push(formatDate(entry.Date, entry.Time));
    output.dataTable.columns["Date"].push(entry["Rounded Date"]);

    output.dataTable.columns.Temperature.push(Number(entry.Temperature) || 0);
    output.dataTable.columns.Wind.push(entry.Wind) || '';
    output.dataTable.columns["Wind Speed"].push(Number(entry["Wind Speed"]) || 0);
    output.dataTable.columns["Wind Gust"].push(Number(entry["Wind Gust"]) || 0);

    output.dataTable.columns["Fire Size"].push(parseNumber(entry["Size"]));
    output.dataTable.columns.Containment.push(parsePercentage(entry.Containment));
    output.dataTable.columns["Structures Threatened"].push(parseNumber(entry["Structures Threatened"]));
    output.dataTable.columns["Structures Destroyed"].push(parseNumber(entry["Structures Destroyed"]));
    output.dataTable.columns["Structures Damaged"].push(parseNumber(entry["Structures Damaged"]));

    output.dataTable.columns["SCE"].push(parseNumber(entry["SCE SCE"]));

    output.dataTable.columns["Data Source"].push(checkSource(entry["Source Fire CA"], entry["Source Weather"]));
});

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

const outputFilePath = '../../data/REPORTS/formatted/deploy/grid-daily.json';
fs.writeFileSync(outputFilePath, JSON.stringify(output));

console.log('Conversion complete. Output saved to grid-daily.json');
