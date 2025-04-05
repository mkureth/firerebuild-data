const fs = require('fs');
const path = require('path');

const inputFilePath = path.join('data/prep', 'prep.json');
const rawData = fs.readFileSync(inputFilePath);
const inputData = JSON.parse(rawData);

const output = {
    dataTable: {
        columns: {
            Date: [],
            Temperature: [],
            Wind: [],
            "Wind Speed": [],
            "Wind Gust": [],
            "Fire Size": [],
            Containment: [],
            "Structures Threatened": [],
            "Structures Destroyed": [],
            "Structures Damaged": [],
            "Data Source": []
        }

    },
    rendering: {
        rows: {
            strictHeights: true,
        },
    },
    header: [
        'Date',
        {

            format: 'Weather Data',
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
            format: 'Fire Data',
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

        },
        'Data Source'
    ],
    columns: [{
        id: 'Date',
        header: {
            format: 'Date'
        }
    }],
};

/*
// Step 2: Initialize the output structure
const output = {
        dataTable: {
          columns: {
            Date: [],
            Temperature: [],
            Wind: [],
            "Wind Speed": [],
            "Wind Gust": [],
            "Fire Size": [],
            Containment: [],
            "Structures Threatened": [],
            "Structures Destroyed": [],
            "Structures Damaged": [],
            "Data Source": []
          }

        },
        rendering: {
            rows: {
                strictHeights: true,
            },
        },
        header: [
            'Date',
            {
                format: 'Nutritional Info',
                columns: [{
                    format: 'Weather Data',
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
                    format: 'Fire Data',
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
                }]
            },
            {
                format: 'Data Source',
                columns: [{
                    columnId: 'Data Source',
                    format: 'Data Source'
                }]
            }
        ],
        columns: [{
            id: 'Date',
            header: {
                format: 'Date'
            }
        }],
    };
*/

inputData.forEach(entry => {
  output.dataTable.columns.Date.push(entry["Display Date"] || null);
  output.dataTable.columns.Temperature.push(Number(entry.Temperature) || 0);
  output.dataTable.columns.Wind.push(entry.Wind) || '';
  output.dataTable.columns["Wind Speed"].push(Number(entry["Wind Speed"]) || 0);
  output.dataTable.columns["Wind Gust"].push(Number(entry["Wind Gust"]) || 0);

  output.dataTable.columns["Fire Size"].push(entry["Size"] || 0);

  output.dataTable.columns.Containment.push(parsePercentage(entry.Containment));
  output.dataTable.columns["Structures Threatened"].push(parseNumber(entry["Structures Threatened"]));
  output.dataTable.columns["Structures Destroyed"].push(parseNumber(entry["Structures Destroyed"]));
  output.dataTable.columns["Structures Damaged"].push(parseNumber(entry["Structures Damaged"]));

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
}

const outputFilePath = path.join('data/deploy', 'output.json');
fs.writeFileSync(outputFilePath, JSON.stringify(output));

console.log('Conversion complete. Output saved to output.json');
