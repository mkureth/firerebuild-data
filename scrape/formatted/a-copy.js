const fs = require('fs');
const path = require('path');

// Define source and destination paths
const filesToCopy = [
    { source: '../fire-ca-gov/data/combined/combined.csv', destination: './data/raw/fire-ca-gov.csv' },
    { source: '../weather-daily/data/combined/combined.csv', destination: './data/raw/weather-daily.csv' },
    { source: '../weather-monthly/data/combined/combined.csv', destination: './data/raw/weather-monthly.csv' }
];

filesToCopy.forEach(file => {
    const sourcePath = path.resolve(__dirname, file.source);
    const destinationPath = path.resolve(__dirname, file.destination);

    // Ensure the destination directory exists
    fs.mkdir(path.dirname(destinationPath), { recursive: true }, (err) => {
        if (err) {
            console.error(`Error creating destination directory for ${file.destination}:`, err);
            return;
        }

        // Copy the file
        fs.copyFile(sourcePath, destinationPath, (err) => {
            if (err) {
                console.error(`Error copying file ${file.source} to ${file.destination}:`, err);
            } else {
                console.log(`File copied successfully from ${file.source} to ${file.destination}`);
            }
        });
    });
});
