const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const moment = require('moment');

const weatherFilePath = '../../../data/PROCESSED/weather/monthly/combined.csv';

function loadWeatherData(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {

        var dateToCheck = moment(row['DateTime']);
        var targetDate = moment('2014-03-26');
        var isGreater = dateToCheck.isAfter(targetDate);

        if (isGreater) {
            results.push({
                date: row['DateTime'],
                precipitation: parseFloat(row['Precipitation']) || 0
            });
        }

      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

function findBestDrySpells(data) {
  if (!Array.isArray(data) || data.length === 0) return [];

  data.sort((a, b) => new Date(a.date) - new Date(b.date));

  let minPrecip = Infinity;
  let maxLength = 0;
  let bestRanges = [];

  for (let start = 0; start < data.length; start++) {
    let totalPrecip = 0;

    for (let end = start; end < data.length; end++) {
      totalPrecip += data[end].precipitation;
      const rangeLength = end - start + 1;

      if (
        totalPrecip < minPrecip ||
        (totalPrecip === minPrecip && rangeLength > maxLength)
      ) {
        minPrecip = totalPrecip;
        maxLength = rangeLength;
        bestRanges = [{
          startDate: data[start].date,
          endDate: data[end].date,
          totalPrecip,
          length: rangeLength
        }];
      } else if (totalPrecip === minPrecip && rangeLength === maxLength) {
        bestRanges.push({
          startDate: data[start].date,
          endDate: data[end].date,
          totalPrecip,
          length: rangeLength
        });
      }
    }
  }

  return bestRanges;
}


function findAllDrySpells(data) {
  if (!Array.isArray(data) || data.length === 0) return [];

  data.sort((a, b) => new Date(a.date) - new Date(b.date));

  const drySpells = [];
  let currentSpell = [];

  for (let i = 0; i < data.length; i++) {
    if (data[i].precipitation === 0) {
      currentSpell.push(data[i]);
    } else {
      if (currentSpell.length > 20) {
        drySpells.push({
          startDate: currentSpell[0].date,
          endDate: currentSpell[currentSpell.length - 1].date,
          length: currentSpell.length
        });
        currentSpell = [];
      }
    }
  }

  // Push the final dry spell if it ended at the last row
  if (currentSpell.length > 0) {
    drySpells.push({
      startDate: currentSpell[0].date,
      endDate: currentSpell[currentSpell.length - 1].date,
      length: currentSpell.length
    });
  }

  return drySpells;
}


// Main Execution
loadWeatherData(weatherFilePath)
  .then(weatherData => {
    //const drySpells = findBestDrySpells(weatherData);
    const drySpells = findAllDrySpells(weatherData);
    console.log('Best dry spells:\n', drySpells);
  })
  .catch(err => {
    console.error('Error loading or processing data:', err);
  });




/*
since Jan 1, 1947, March 26, 2014 is the first recorded rainfall greater than 0.0 inches.  of 0.1 inches


*/

