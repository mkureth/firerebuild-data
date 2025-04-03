const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const moment = require('moment');

const PAGES_DIR = './data/html';
const OUTPUT_DIR = './data/json';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Read all HTML files in the pages directory
fs.readdir(PAGES_DIR, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    files.filter(file => file.endsWith('.html')).forEach(file => {
        const filePath = path.join(PAGES_DIR, file);
        const html = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio.load(html);
        
        const incidentData = {};
        
        // Extract the guid from the filename
        const [guid] = file.split('_');
        incidentData.guid = guid;

        // Extract the Incident Facts section
        $('.border.border-danger-dark.mt-4 dl.row.p-3 dt').each((index, element) => {
            const key = $(element).text().trim();
            const value = $(element).next('dd').text().trim();
            if (key && value) {
                incidentData[key] = value;
            }
        });

        // Extract Date and Time
        let date = '';
        let time = '';
        $('.mb-0 dt').each((index, element) => {
            const key = $(element).text().replace(':', '').trim();
            const value = $(element).next('dd').text().trim();
            if (key === 'Date') date = value;
            if (key === 'Time') time = value;
        });

        if (date && time) {
            // Convert date and time to the desired format
            const formattedDateTime = moment(`${date} ${time}`, 'MM/DD/YYYY h:mm A').format('YYYY-MM-DD-HH-mm');
            incidentData.Date = date;
            incidentData.Time = time;
            
            const filename = `${formattedDateTime}.json`;
            const outputPath = path.join(OUTPUT_DIR, filename);
            
            fs.writeFileSync(outputPath, JSON.stringify(incidentData, null, 2));
            console.log(`Saved: ${outputPath}`);
        } else {
            console.warn(`Skipping file due to missing Date/Time: ${file}`);
        }
    });
});
