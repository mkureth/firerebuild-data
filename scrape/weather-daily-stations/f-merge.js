const fs = require('fs');
const path = require('path');
const moment = require('moment');

const inputDir = path.join(__dirname, 'data/json-combined');
const outputDir = path.join(__dirname, 'data/json-merged');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Helper to round to nearest 15 minutes
function roundToNearest15Min(datetime) {
  const m = moment(datetime);
  const minutes = Math.round(m.minutes() / 15) * 15;
  return m.minutes(minutes).seconds(0).milliseconds(0).format('YYYY-MM-DD HH:mm:00');
}

fs.readdirSync(inputDir).forEach((file) => {
  if (path.extname(file) === '.json') {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);

    try {
      const rawData = fs.readFileSync(inputPath, 'utf-8');
      const jsonArray = JSON.parse(rawData);

      const transformed = {};

      jsonArray.forEach((entry) => {
        const station = entry.station;
        const roundedDate = roundToNearest15Min(entry.date);

        const key_s = `${station}_s`;
        const key_g = `${station}_g`;
        const key_d = `${station}_d`;

        if (!transformed[roundedDate]) {
          transformed[roundedDate] = {
            [key_s]: entry.wind_speed,
            [key_g]: entry.wind_gust,
            //[key_d]: entry.wind_dir
          };
        } else {
          // Keep maximum values for _s and _g
          transformed[roundedDate][key_s] = Math.max(transformed[roundedDate][key_s] || 0, entry.wind_speed);
          transformed[roundedDate][key_g] = Math.max(transformed[roundedDate][key_g] || 0, entry.wind_gust);
          // Always update direction (_d) to the latest one seen
          //transformed[roundedDate][key_d] = entry.wind_dir;
        }
      });

      fs.writeFileSync(outputPath, JSON.stringify(transformed, null, 2), 'utf-8');
      console.log(`Processed: ${file}`);
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message);
    }
  }
});
