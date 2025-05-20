// format-json.js

const fs = require('fs');
const path = require('path');

// Define input and output directories
const inputDir = path.join(__dirname, 'data/json-clean/KCALOSAN958');
const outputDir = path.join(__dirname, 'data/json-formatted/KCALOSAN958');

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read all JSON files from the input directory
fs.readdirSync(inputDir).forEach(file => {
  if (path.extname(file) === '.json') {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);

    try {
      const rawData = fs.readFileSync(inputPath, 'utf-8');
      const data = JSON.parse(rawData);

      // Transform the data
      const formattedData = data.map(entry => ({
        station: entry.stationID,
        date: entry.obsTimeLocal,
        temperature: entry.imperial?.tempHigh ?? null,
        wind_speed: entry.imperial?.windspeedHigh ?? null,
        wind_gust: entry.imperial?.windgustHigh ?? null,
        dew_point: entry.imperial?.dewptHigh ?? null,
        wind_chill: entry.imperial?.windchillHigh ?? null,
        heat_index: entry.imperial?.heatindexHigh ?? null,
        pressure: entry.imperial?.pressureMax ?? null,
        precip_rate: entry.imperial?.precipRate ?? null,
        precip_total: entry.imperial?.precipTotal ?? null,
        humidity: entry.humidityHigh ?? null,
        wind_dir: entry.winddirAvg ?? null,
      }));

      // Save the new JSON to the output directory
      fs.writeFileSync(outputPath, JSON.stringify(formattedData), 'utf-8');
      console.log(`Formatted and saved: ${file}`);
    } catch (err) {
      console.error(`Error processing file ${file}:`, err.message);
    }
  }
});
