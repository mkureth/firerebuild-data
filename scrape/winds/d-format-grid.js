const fs = require('fs');
const path = require('path');
const moment = require('moment');

const inputFilePath = path.join('data/prep', 'times.json');
const rawData = fs.readFileSync(inputFilePath);
const inputData = JSON.parse(rawData);

const output = {
    dataTable: {
        columns: {
            "Date": [],

            "Temperature Max": [],
            "Temperature Avg": [],
            "Temperature Min": [],

            "Wind Speed Max": [],
            "Wind Speed Avg": [],
            "Wind Speed Min": [],

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
            format: 'Temperature',
            columns: [{
                columnId: 'Temperature Max',
                format: 'Temperature Max'
            }, {
                columnId: 'Temperature Avg',
                format: 'Temperature Avg'
            }, {
                columnId: 'Temperature Min',
                format: 'Temperature Min'
            }]
        }, {
            format: 'Wind Speed',
            columns: [{
                columnId: 'Wind Speed Max',
                format: 'Wind Speed Max'
            }, {
                columnId: 'Wind Speed Avg',
                format: 'Wind Speed Avg'
            }, {
                columnId: 'Wind Speed Min',
                format: 'Wind Speed Min'
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

    output.dataTable.columns["Date"].push(entry.date);
    output.dataTable.columns["Temperature Max"].push(entry.temperature_max);
    output.dataTable.columns["Temperature Avg"].push(entry.temperature_avg);
    output.dataTable.columns["Temperature Min"].push(entry.temperature_min);
    output.dataTable.columns["Wind Speed Max"].push(entry.wind_speed_max);
    output.dataTable.columns["Wind Speed Avg"].push(entry.wind_speed_avg);
    output.dataTable.columns["Wind Speed Min"].push(entry.wind_speed_min);
    output.dataTable.columns["Data Source"].push( checkSource(entry.source) );
    //output.dataTable.columns["Data Source"].push(entry.source);

/*
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
*/


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
    const momentDate = moment(date + ' ' + time, "YYYY-MM-DD HH:mm");
    return  momentDate.format('YYYY-MM-DDTHH:mm:ss[Z]');
}

const outputFilePath = path.join('data/deploy', 'grid-wind.json');
fs.writeFileSync(outputFilePath, JSON.stringify(output));

console.log('Conversion complete. Output saved to grid-wind.json');
