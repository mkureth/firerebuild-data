const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio'); // Need to install this package: npm install cheerio

// --- Configuration ---
const inputFolder = './data/html/KCALOSAN958'; // Folder containing your HTML files
const outputFolder = './data/json-raw/KCALOSAN958'; // Folder where JSON files will be saved
const scriptTagId = 'app-root-state'; // The ID of the script tag containing the JSON

// --- Ensure output folder exists ---
if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
    console.log(`Created output folder: ${outputFolder}`);
}

// --- Read files from input folder ---
fs.readdir(inputFolder, (err, files) => {
    if (err) {
        console.error(`Error reading input folder ${inputFolder}:`, err);
        return;
    }

    // Filter for HTML files (you might want to adjust this regex based on your file extensions)
    const htmlFiles = files.filter(file => path.extname(file).toLowerCase() === '.html');

    if (htmlFiles.length === 0) {
        console.log(`No HTML files found in ${inputFolder}.`);
        return;
    }

    console.log(`Found ${htmlFiles.length} HTML files to process.`);

    // --- Process each HTML file ---
    htmlFiles.forEach(file => {
        const inputFilePath = path.join(inputFolder, file);
        const outputFileName = `${path.parse(file).name}.json`; // Use original name, change extension
        const outputFilePath = path.join(outputFolder, outputFileName);

        fs.readFile(inputFilePath, 'utf8', (readErr, data) => {
            if (readErr) {
                console.error(`Error reading file ${inputFilePath}:`, readErr);
                return;
            }

            try {
                // Load HTML into Cheerio
                const $ = cheerio.load(data);

                // Find the script tag by ID
                const scriptTag = $(`script#${scriptTagId}`);

                if (scriptTag.length === 0) {
                    console.warn(`Script tag with ID "${scriptTagId}" not found in ${file}. Skipping.`);
                    return;
                }

                // Extract the text content (JSON string)
                const jsonString = scriptTag.html(); // Use .html() or .text() - .html() is often safer for script contents

                if (!jsonString) {
                     console.warn(`Script tag with ID "${scriptTagId}" is empty in ${file}. Skipping.`);
                     return;
                }

                // Parse the JSON string to validate and format it
                const jsonData = JSON.parse(jsonString);

                // Write the JSON data to the output file
                // Use JSON.stringify with null, 2 for pretty printing
                fs.writeFile(outputFilePath, JSON.stringify(jsonData, null, 2), 'utf8', (writeErr) => {
                    if (writeErr) {
                        console.error(`Error writing JSON to ${outputFilePath}:`, writeErr);
                    } else {
                        console.log(`Successfully extracted and saved JSON from ${file} to ${outputFileName}`);
                    }
                });

            } catch (parseErr) {
                console.error(`Error processing file ${file}:`, parseErr);
            }
        });
    });
});

