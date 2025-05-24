
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
            text: 'Pacific Palisades Fire: Historical Context for Drought Occurrences'
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
                format: 'Drought Period',
                columns: [{
                    columnId: 'Drought Start Date',
                    format: 'Start Date'
                }, {
                    columnId: 'Drought End Date',
                    format: 'End Date'
                }, {
                    columnId: 'Drought Total Days',
                    format: 'Total Days'
                }, {
                    columnId: 'Drought Total Precipitation',
                    format: 'Total Precipitation'
                }]
            }, {
                format: 'Precipitation between Drought Periods',
                columns: [{
                    columnId: 'Rain Between Droughts Start',
                    format: 'Start Date'
                }, {
                    columnId: 'Rain Between Droughts End',
                    format: 'End Date'
                }, {
                    columnId: 'Rain Total Days',
                    format: 'Total Days'
                }, {
                    columnId: 'Rain Between Droughts',
                    format: 'Total Precipitation'
                }]
            }, {
                columnId: 'Previous 180 Days Precipitation',
                format: '180 Days Before'
            }
            
        ],

        columns: [
            {
                id: 'Drought Start Date',
                cells: {
                    formatter: function () {
                        const dateMoment = moment.utc(this.value);
                        const reformattedDate = dateMoment.format('MMM D, YYYY');
                        return reformattedDate;
                    }
                }
            }, {
                id: 'Drought End Date',
                cells: {
                    formatter: function () {
                        const dateMoment = moment.utc(this.value);
                        const reformattedDate = dateMoment.format('MMM D, YYYY');
                        return reformattedDate;
                    }
                }
            }, {
                id: 'Rain Between Droughts Start',
                cells: {
                    formatter: function () {
                        const dateMoment = moment.utc(this.value);
                        const reformattedDate = dateMoment.format('MMM D, YYYY');
                        return reformattedDate;
                    }
                }
            }, {
                id: 'Rain Between Droughts End',
                cells: {
                    formatter: function () {
                        const dateMoment = moment.utc(this.value);
                        const reformattedDate = dateMoment.format('MMM D, YYYY');
                        return reformattedDate;
                    }
                }
            }, {
                id: 'Drought Total Days',
                cells: {
                    formatter: function () {
                        var displayValue = this.value + ' days';
                        return displayValue;
                    }
                }
            }, {
                id: 'Rain Total Days',
                cells: {
                    formatter: function () {
                        var displayValue = this.value + ' days';
                        return displayValue;
                    }
                }
            }, {
                id: 'Drought Total Precipitation',
                cells: {
                    formatter: function () {
                        var displayValue = this.value.toFixed(1) + ' inches';
                        return displayValue;
                    }
                }
            }, {
                id: 'Previous 180 Days Precipitation',
                cells: {
                    formatter: function () {
                        var displayValue = this.value.toFixed(1) + ' inches';
                        return displayValue;
                    }
                }
            }, {
                id: 'Rain Between Droughts',
                cells: {
                    formatter: function () {
                        var displayValue = this.value.toFixed(1) + ' inches';
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


