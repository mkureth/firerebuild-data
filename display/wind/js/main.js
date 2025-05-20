
//SCE https://capuc.maps.arcgis.com/apps/dashboards/ecd21b1c204f47da8b1fcc4c5c3b7d3a

fetch(dataURL)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok: ' + response.statusText);
    }
    return response.json();
  })
  .then(jsonData => {
    Grid.grid('container', {
        caption: jsonData.caption,
        description: jsonData.description,
        rendering: jsonData.rendering,
        dataTable: jsonData.dataTable,
        header: [
            "Date",
            {
            "format": "Wind Speed",
            "columns": [
                {
                "columnId": "Wind Speed Max",
                "format": "Wind Speed Max"
                },
                {
                "columnId": "Wind Speed Avg",
                "format": "Wind Speed Avg"
                },
                {
                "columnId": "Wind Speed Min",
                "format": "Wind Speed Min"
                }
            ]
            },
            "Data Source"
        ],

        columns: [{
            id: 'Date',
            header: {
                format: 'Date'
            }
        }, {
            id: 'Date',
            cells: {
                formatter: function () {
                    var date = new Date(this.value);
                    var laOffsetMinutes = +12 * 60;
                    var adjustedDate = new Date(date.getTime() + laOffsetMinutes * 60 * 1000);
                    var options = { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Los_Angeles' };
                    var displayDate = adjustedDate.toLocaleDateString('en-US', options).replace(',', '');
                    return displayDate;
                }
            }
        }, {
            id: 'Temperature Max',
            cells: {
                formatter: function () {
                    var degrees = ' ' + String.fromCharCode(176) + 'F';
                    return this.value + degrees;
                }
            }
        }, {
            id: 'Temperature Avg',
            cells: {
                formatter: function () {
                    var degrees = ' ' + String.fromCharCode(176) + 'F';
                    return this.value + degrees;
                }
            }
        }, {
            id: 'Temperature Min',
            cells: {
                formatter: function () {
                    var degrees = ' ' + String.fromCharCode(176) + 'F';
                    return this.value + degrees;
                }
            }
        }, {
            id: 'Wind Speed Max',
            cells: {
                format: '{value} mph'
            }
        }, {
            id: 'Wind Speed Avg',
            cells: {
                format: '{value} mph'
            }
        }, {
            id: 'Wind Speed Min',
            cells: {
                format: '{value} mph'
            }
        }]
    })
  })
  .catch(error => {
    console.error('Failed to load data:', error);
  });
