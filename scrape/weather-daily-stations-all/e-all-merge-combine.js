const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const file1Path = path.join(__dirname, 'data/main-combined/combined.csv');
const file2Path = path.join(__dirname, 'data/station-combined/combined.csv');
const outputFilePath = path.join(__dirname, 'data/all-merged/final-combined.csv');

// Ensure the output directory exists
const outputDir = path.dirname(outputFilePath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.readFile(file1Path, 'utf8', (err, data1) => {
  if (err) {
    console.error(`Error reading file ${file1Path}:`, err);
    return;
  }

  fs.readFile(file2Path, 'utf8', (err, data2) => {
    if (err) {
      console.error(`Error reading file ${file2Path}:`, err);
      return;
    }

    const result1 = Papa.parse(data1, { header: true });
    const result2 = Papa.parse(data2, { header: true });

    const combinedRows = [...result1.data, ...result2.data];

    const targetColumns = [
      'Temperature High',
      'Wind Speed High',
      'Wind Gust High',
      'Temperature Low',
      'Wind Speed Low',
      'Wind Gust Low'
    ];

    const tempRows = [];
    const allColumnsSet = new Set(['DateTime']);

    // Transform rows
    combinedRows.forEach(row => {
      const station = row['Station'];
      const dateTime = row['DateTime'];
      if (!station || !dateTime) return; // skip malformed rows

      const newRow = { DateTime: dateTime };

      for (const key in row) {
        if (key === 'DateTime' || key === 'Station') continue;

        if (targetColumns.includes(key)) {
          const newKey = `${station} ${key}`;
          newRow[newKey] = row[key];
          allColumnsSet.add(newKey);
        } else {
          newRow[key] = row[key];
          allColumnsSet.add(key);
        }
      }

      tempRows.push(newRow);
    });

    // Sort by DateTime
    tempRows.sort((a, b) => new Date(a.DateTime) - new Date(b.DateTime));

    // Merge rows by DateTime
    const mergedMap = new Map();

    tempRows.forEach(row => {
      const dt = row.DateTime;
      if (!mergedMap.has(dt)) {
        mergedMap.set(dt, { ...row });
      } else {
        const existing = mergedMap.get(dt);
        for (const key in row) {
          if (!existing[key] || existing[key].trim() === '') {
            if (row[key] && row[key].trim() !== '' && row[key] !== '0') {
              existing[key] = row[key];
            }
          }
        }
      }
    });

    const mergedRows = Array.from(mergedMap.values());

    const allColumns = ['DateTime', ...Array.from(allColumnsSet).filter(c => c !== 'DateTime')];

    const csvOutput = Papa.unparse(mergedRows, {
      columns: allColumns
    });

    fs.writeFile(outputFilePath, csvOutput, 'utf8', err => {
      if (err) {
        console.error(`Error writing file ${outputFilePath}:`, err);
        return;
      }
      console.log(`Successfully transformed, deduplicated, and saved to ${outputFilePath}`);
    });
  });
});
