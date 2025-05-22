const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');
const moment = require('moment');

// File paths
const INPUT_FILE = path.resolve(__dirname, '../../../data/PROCESSED/weather/monthly/combined.csv');
const OUTPUT_JSON = path.resolve(__dirname, '../../../deploy/content/palisades-fire-weather-report/reports/historic-drought-occurrences/files/drought-occurrences.json');
const OUTPUT_CSV = path.resolve(__dirname, '../../../deploy/content/palisades-fire-weather-report/reports/historic-drought-occurrences/files/drought-occurrences.csv');

function parseDate(dateStr) {
  return new Date(dateStr);
}

function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const records = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const date = parseDate(row.DateTime);
        const precipitation = parseFloat(row.Precipitation);
        if (!isNaN(date) && !isNaN(precipitation)) {
          records.push({ date, precipitation });
        }
      })
      .on('end', () => {
        records.sort((a, b) => a.date - b.date);
        resolve(records);
      })
      .on('error', reject);
  });
}

function getDayDifference(date1, date2) {
  const momentDate1 = moment(date1);
  const momentDate2 = moment(date2);
  const diffInDays = momentDate2.diff(momentDate1, 'days');
  return diffInDays;
}

function detectDroughts(data) {
  const droughts = [];
  let currentDrought = null;
  let previousDroughtEnd = null;

  for (let i = 0; i < data.length; i++) {
    const entry = data[i];

    if (entry.precipitation <= .3) {
      if (!currentDrought) {
        currentDrought = {
          start: entry.date,
          end: entry.date,
          totalPrecip: entry.precipitation,
          startIndex: i
        };
      } else {
        currentDrought.end = entry.date;
        currentDrought.totalPrecip += entry.precipitation;
      }
    } else if (currentDrought) {
      const totalDays = getDayDifference(currentDrought.start, currentDrought.end);
      
      // Skip short droughts
      if (totalDays < 20) {
        currentDrought = null;
        continue;
      }

/*
      const startIdx = currentDrought.startIndex;
      const priorStartDate = new Date(currentDrought.start);
      priorStartDate.setDate(priorStartDate.getDate() - 180);
*/

      const startIdx = currentDrought.startIndex;
      const priorStartDate = moment(currentDrought.start).subtract(180, 'days');

      let prevPrecip = 0;
      for (let j = 0; j < startIdx; j++) {
        if (data[j].date >= priorStartDate && data[j].date < currentDrought.start) {
          prevPrecip += data[j].precipitation;
        }
      }

      // Default empty values
      let rainBetweenDroughts = '';
      let rainBetweenDroughtsRangeStart = '';
      let rainBetweenDroughtsRangeEnd = '';
      let totalRainDays = '';

      if (previousDroughtEnd) {
        const rainStart = moment(previousDroughtEnd).add(1, 'days').startOf('day');
        const rainEnd = moment(currentDrought.start).subtract(1, 'days').endOf('day');
        const rainAmount = data
          .filter(entry => {
            const entryDate = moment(entry.date); // Convert entry.date to a Moment object for comparison
            return entryDate.isSameOrAfter(rainStart, 'day') && entryDate.isSameOrBefore(rainEnd, 'day');
          })
          .reduce((sum, entry) => sum + entry.precipitation, 0);

        rainBetweenDroughts = rainAmount.toFixed(2);
        rainBetweenDroughtsRangeStart = rainStart.toISOString().split('T')[0];
        rainBetweenDroughtsRangeEnd = rainEnd.toISOString().split('T')[0];

        totalRainDays = getDayDifference(rainBetweenDroughtsRangeStart, rainBetweenDroughtsRangeEnd);
      }

      const droughtEntry = {
        startDate: currentDrought.start.toISOString().split('T')[0],
        endDate: currentDrought.end.toISOString().split('T')[0],
        totalPrecipitation: currentDrought.totalPrecip.toFixed(2),
        previousPrecipitation: prevPrecip.toFixed(2),
        totalDays,
        rainBetweenDroughts,
        rainBetweenDroughtsRangeStart,
        rainBetweenDroughtsRangeEnd,
        totalRainDays
      };

      if (droughtEntry.previousPrecipitation > 0) {
        droughts.push(droughtEntry);
      }
      previousDroughtEnd = currentDrought.end;
      currentDrought = null;
    }
  }

  return droughts;
}


async function saveOutputs(droughts) {
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(droughts, null, 2));

  const csvWriter = createObjectCsvWriter({
    path: OUTPUT_CSV,
    header: [
      { id: 'startDate', title: 'Drought Start Date' },
      { id: 'endDate', title: 'Drought End Date' },
      { id: 'totalDays', title: 'Drought Total Days' },
      { id: 'totalPrecipitation', title: 'Drought Total Precipitation' },

      { id: 'previousPrecipitation', title: 'Previous 180 Days Precipitation' },
      
      { id: 'rainBetweenDroughtsRangeStart', title: 'Rain Between Droughts Start' },
      { id: 'rainBetweenDroughtsRangeEnd', title: 'Rain Between Droughts End' },
      { id: 'totalRainDays', title: 'Rain Total Days' },
      { id: 'rainBetweenDroughts', title: 'Rain Between Droughts' }
    ]
  });

  await csvWriter.writeRecords(droughts);
}

async function run() {
  try {
    const records = await readCSV(INPUT_FILE);
    const droughts = detectDroughts(records);
    await saveOutputs(droughts);
    console.log('Drought occurrences saved to JSON and CSV.');
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
