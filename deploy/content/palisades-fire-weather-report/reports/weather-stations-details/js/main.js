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
            text: 'Pacific Palisades Fire: Weather Stations and Details'
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
            {
                format: 'Station Information',
                columns: [{
                    columnId: 'Station',
                    format: 'Station'
                }, {
                    columnId: 'Name',
                    format: 'Name'
                }, {
                    columnId: 'Address',
                    format: 'Address'
                }, {
                    columnId: 'Lat',
                    format: 'Lat'
                }, {
                    columnId: 'Lng',
                    format: 'Lng'
                }]
            }, {
                format: 'Distance from Key Points',
                columns: [{
                    columnId: 'Fire',
                    format: 'Fire Origin'
                }, {
                    columnId: 'KCATOPAN',
                    format: 'KCATOPAN'
                }, {
                    columnId: 'KLAX',
                    format: 'KLAX'
                }]
            }, {
                columnId: 'Anomaly',
                format: 'Anomaly'
            }
            
        ],

        columns: [{
            id: 'Fire',
            cells: {
                formatter: function () {
                    var displayValue = this.value.toFixed(1) + ' miles';
                    return displayValue;
                }
            }
        }, {
            id: 'KCATOPAN',
            cells: {
                formatter: function () {
                    var displayValue = this.value.toFixed(1) + ' miles';
                    return displayValue;
                }
            }
        }, {
            id: 'KLAX',
            cells: {
                formatter: function () {
                    var displayValue = this.value.toFixed(1) + ' miles';
                    return displayValue;
                }
            }
        }, {
            id: 'Anomaly',
            cells: {
                formatter: function () {
                    var displayValue = ' ';
                    if (this.value) {
                        displayValue = 'Excluded';
                    }
                    return displayValue;
                }
            }
        }]
    })
  })
  .catch(error => {
    console.error('Failed to load data:', error);
  });
