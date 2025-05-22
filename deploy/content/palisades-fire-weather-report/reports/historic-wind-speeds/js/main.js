
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
            {
                columnId: 'Date',
                format: 'Date'
            }, {
                columnId: 'Wind Speed Max',
                format: 'Wind Speed Max'
            }
        ],

        columns: [{
            id: 'Date',
            cells: {
                formatter: function () {
                    const dateMoment = moment.utc(this.value);
                    const reformattedDate = dateMoment.format('MMM D, YYYY');
                    return reformattedDate;
                }
            }
        }]
    })
  })
  .catch(error => {
    console.error('Failed to load data:', error);
  });
