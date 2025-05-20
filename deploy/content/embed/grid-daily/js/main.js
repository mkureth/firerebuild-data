
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
            id: 'KCAMALIB62_s',
            cells: {
                format: '{value} mph'
            }
        }, {
            id: 'KCAMALIB62_g',
            cells: {
                format: '{value} mph'
            }
        }, {
            id: 'KCAPACIF132_s',
            cells: {
                format: '{value} mph'
            }
        }, {
            id: 'KCAPACIF132_g',
            cells: {
                format: '{value} mph'
            }
        }, {
            id: 'KCAMALIB87_s',
            cells: {
                format: '{value} mph'
            }
        }, {
            id: 'KCAMALIB87_g',
            cells: {
                format: '{value} mph'
            }
        }, {
            id: 'KCAPACIF208_s',
            cells: {
                format: '{value} mph'
            }
        }, {
            id: 'KCAPACIF208_g',
            cells: {
                format: '{value} mph'
            }
        }, {
            id: 'KCALOSAN958_s',
            cells: {
                format: '{value} mph'
            }
        }, {
            id: 'KCALOSAN958_g',
            cells: {
                format: '{value} mph'
            }
        }, {
            id: 'KCAPACIF287_s',
            cells: {
                format: '{value} mph'
            }
        }, {
            id: 'KCAPACIF287_g',
            cells: {
                format: '{value} mph'
            }
        }, {
            id: 'KCAMALIB133_s',
            cells: {
                format: '{value} mph'
            }
        }, {
            id: 'KCAMALIB133_g',
            cells: {
                format: '{value} mph'
            }
        }, {
            id: 'KCAPACIF320_s',
            cells: {
                format: '{value} mph'
            }
        }, {
            id: 'KCAPACIF320_g',
            cells: {
                format: '{value} mph'
            }
        }

        ]
    })
  })
  .catch(error => {
    console.error('Failed to load data:', error);
  });
