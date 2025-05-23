
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
            text: 'Pacific Palisades Fire: Cal Fire Reporting Timeline'
        },
        description: {
            text: 'Data is provided by https://www.fire.ca.gov/incidents/2025/1/7/palisades-fire'
        },
        rendering: {
            theme: 'hcg-theme-default theme-compact',
            rows: {
                strictHeights: true,
            },
        },
        header: [
            {
                columnId: 'DateTime',
                format: 'Date and Time'
            },
            {
                format: 'Fire Size and Containment',
                columns: [{
                    columnId: 'Size',
                    format: 'Size'
                }, {
                    columnId: 'Containment',
                    format: 'Containment'
                }]
            }, {
                format: 'Structures Threatened, Damaged, and Destroyed',
                columns: [{
                    columnId: 'Structures Threatened',
                    format: 'Threatened'
                }, {
                    columnId: 'Structures Damaged',
                    format: 'Damaged'
                }, {
                    columnId: 'Structures Destroyed',
                    format: 'Destroyed'
                }]
            }, {
                format: 'Civilian',
                columns: [{
                    columnId: 'Civilian Injuries',
                    format: 'Injuries'
                }, {
                    columnId: 'Civilian Fatalities',
                    format: 'Fatalities'
                }]
            }, {
                format: 'Firefighter',
                columns: [{
                    columnId: 'Firefighter Injuries',
                    format: 'Injuries'
                }, {
                    columnId: 'Firefighter Fatalities',
                    format: 'Fatalities'
                }]
            }, {
                columnId: 'Source',
                format: 'Cal Fire Source'
            }
            
        ],

        columns: [
            {
                id: 'DateTime',
                cells: {
                    formatter: function () {
                        const dateMoment = moment.utc(this.value);
                        const reformattedDate = dateMoment.format('MMM D, YYYY h:mm A');
                        return reformattedDate;
                    }
                }
            }, {
                id: 'Size',
                cells: {
                    formatter: function () {
                        var displayValue = this.value.toLocaleString('en-US');
                        return displayValue + ' acres';
                    }
                }
            }, {
                id: 'Structures Threatened',
                cells: {
                    formatter: function () {
                        var displayValue = this.value.toLocaleString('en-US');
                        return displayValue;
                    }
                }
            }, {
                id: 'Structures Damaged',
                cells: {
                    formatter: function () {
                        var displayValue = this.value.toLocaleString('en-US');
                        return displayValue;
                    }
                }
            }, {
                id: 'Structures Destroyed',
                cells: {
                    formatter: function () {
                        var displayValue = this.value.toLocaleString('en-US');
                        return displayValue;
                    }
                }
            }, {
                id: 'Containment',
                cells: {
                    formatter: function () {
                        var displayValue = this.value + '%';
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
