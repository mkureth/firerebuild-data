//SOURCE: https://capuc.maps.arcgis.com/apps/dashboards/ecd21b1c204f47da8b1fcc4c5c3b7d3a

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Input and output paths
const inputPath = path.join(__dirname, 'data/source/sce-fire.csv');
const outputDir = path.join(__dirname, 'data/json');
const outputPath = path.join(outputDir, 'sce-extract.json');

const results = [];


fs.createReadStream(inputPath)
  .pipe(csv())
  .on('data', (row) => {
    const {
      de_energization_starting_date,
      iou,
      customers_de_energized,
      full_restoration_date
    } = row;

    // Create the desired object
    results.push({
      start: de_energization_starting_date,
      end: full_restoration_date,
      [iou]: customers_de_energized
    });



  })
  .on('end', () => {
    // Ensure the output directory exists
    fs.mkdirSync(outputDir, { recursive: true });

    // Write to JSON file
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');

    console.log(`✅ Data saved to ${outputPath}`);
  })
  .on('error', (err) => {
    console.error('❌ Error processing file:', err);
  });
