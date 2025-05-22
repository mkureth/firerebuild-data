
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
                columnId: 'Start Date',
                format: 'Start Date'
            }, {
                columnId: 'End Date',
                format: 'End Date'
            }, {
                columnId: 'Days',
                format: 'Days'
            }
            
        ],

        columns: [{
            id: 'Start Date',
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
                    const reformattedDate = `${month} ${day}, ${year}`;
                    return reformattedDate;
                }
            }
        }, {
            id: 'End Date',
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
                    const reformattedDate = `${month} ${day}, ${year}`;
                    return reformattedDate;
                }
            }
        }]
    })
  })
  .catch(error => {
    console.error('Failed to load data:', error);
  });
