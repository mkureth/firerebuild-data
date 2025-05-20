
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
        header: jsonData.header,
//        columns: jsonData.columns
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
                    var laOffsetMinutes = +0 * 60;
                    var adjustedDate = new Date(date.getTime() + laOffsetMinutes * 60 * 1000);
                    var options = { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Los_Angeles' };
                    var displayDate = adjustedDate.toLocaleDateString('en-US', options).replace(',', '');
                    return displayDate;
                }
            }
        }, {
            id: 'Temperature',
            cells: {
                formatter: function () {
                    var degrees = ' ' + String.fromCharCode(176) + 'F';
                    return this.value + degrees;
                }
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
            id: 'Structures Destroyed',
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
            id: 'SCE',
            cells: {
                formatter: function () {
                    var displayValue = this.value.toLocaleString('en-US');
                    return displayValue;
                }
            }
        }, {
            id: 'Containment',
            cells: {
                format: '{value}%'
            }
        }]
    })
  })
  .catch(error => {
    console.error('Failed to load data:', error);
  });
