
fetch(dataURL)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok: ' + response.statusText);
    }
    return response.json();
  })
  .then(jsonData => {
    Grid.grid('container', {
        dataTable: jsonData.dataTable,
        caption: {
            text: 'Pacific Palisades Fire: Wind Conditions During Potential Containment Window (10:00 a.m. to 4:00 p.m.)'
        },
        description: {
            text: 'Weather Data is provided by https://weather.com'
        },
        rendering: {
            theme: 'hcg-theme-default theme-compact',
            rows: {
                strictHeights: true,
            },
        },
        header: [
            'Station',
            {
                format: 'Highest Recorded Wind Speed',
                columns: [{
                    columnId: 'Wind Speed Time',
                    format: 'Wind Speed Time'
                }, {
                    columnId: 'Wind Speed High',
                    format: 'Wind Speed High'
                }]
            }, {
                format: 'Highest Recorded Wind Gust',
                columns: [{
                    columnId: 'Wind Gust Time',
                    format: 'Wind Gust Time'
                }, {
                    columnId: 'Wind Gust High',
                    format: 'Wind Gust High'
                }]
            }, {
                columnId: 'Distance',
                format: 'Distance from Fire Origin'
            }
            
        ],

        columns: [
            {
            id: 'Wind Speed Time',
            cells: {
                formatter: function () {
                    const dateMoment = moment.utc(this.value);
                    const reformattedDate = dateMoment.format('h:mm A');
                    return reformattedDate;
                }
            }
            }, {
            id: 'Wind Gust Time',
            cells: {
                formatter: function () {
                    const dateMoment = moment.utc(this.value);
                    const reformattedDate = dateMoment.format('h:mm A');
                    return reformattedDate;
                }
            }
            }, {
            id: 'Wind Speed High',
            cells: {
                formatter: function () {
                    var displayValue = this.value.toFixed(1) + ' mph';
                    return displayValue;
                }
            }
            }, {
            id: 'Wind Gust High',
            cells: {
                formatter: function () {
                    var displayValue = this.value.toFixed(1) + ' mph';
                    return displayValue;
                }
            }
            }, {
            id: 'Distance',
            cells: {
                formatter: function () {
                    var displayValue = this.value.toFixed(1) + ' miles';
                    return displayValue;
                }
            }
            }
        ]
    })
  })
  .catch(error => {
    console.error('Failed to load data:', error);
  });
