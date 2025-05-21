
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
            text: 'Pacific Palisades Fire: Highest Wind Speed Analysis by Station Proximity to Fire Origin (January 7, 2025)'
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

        columns: [{
            id: 'Wind Speed Time',
            cells: {
                formatter: function () {
                    const date = new Date(this.value);
                    const monthNames = [
                      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                    ];
                    const month = monthNames[date.getMonth()];
                    const day = date.getDate();
                    const year = date.getFullYear();
                    let hours = date.getHours();
                    const minutes = date.getMinutes();
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    hours = hours ? hours : 12; // the hour '0' should be '12'
                    const minutesPadded = minutes < 10 ? '0' + minutes : minutes;
                    //const reformattedDate = `${month} ${day}, ${year} ${hours}:${minutesPadded} ${ampm}`;
                    const reformattedDate = `${hours}:${minutesPadded} ${ampm}`;
                    return reformattedDate;
                }
            }
        }, {
            id: 'Wind Gust Time',
            cells: {
                formatter: function () {
                    const date = new Date(this.value);
                    const monthNames = [
                      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                    ];
                    const month = monthNames[date.getMonth()];
                    const day = date.getDate();
                    const year = date.getFullYear();
                    let hours = date.getHours();
                    const minutes = date.getMinutes();
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    hours = hours ? hours : 12; // the hour '0' should be '12'
                    const minutesPadded = minutes < 10 ? '0' + minutes : minutes;
                    //const reformattedDate = `${month} ${day}, ${year} ${hours}:${minutesPadded} ${ampm}`;
                    const reformattedDate = `${hours}:${minutesPadded} ${ampm}`;
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
        }]
    })
  })
  .catch(error => {
    console.error('Failed to load data:', error);
  });
