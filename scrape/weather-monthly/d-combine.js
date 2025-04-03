const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Parser } = require('json2csv');

const inputFolder = path.join(__dirname, 'csvtest');
const outputCSVFile = path.join(__dirname, 'combined.csv');
const outputJSONFile = path.join(__dirname, 'combined.json');

let allData = [];
let headersSet = new Set();

fs.readdir(inputFolder, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }
    
    let csvFiles = files.filter(file => path.extname(file) === '.csv');
    let fileReadCount = 0;

    csvFiles.forEach(file => {
        let filePath = path.join(inputFolder, file);
        let fileData = [];
        
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                fileData.push(row);
                Object.keys(row).forEach(header => headersSet.add(header));
            })
            .on('end', () => {
                allData = allData.concat(fileData);
                fileReadCount++;
                
                if (fileReadCount === csvFiles.length) {
                    writeCombinedFiles();
                }
            });
    });
});

function writeCombinedFiles() {
    const headers = Array.from(headersSet);
    const json2csvParser = new Parser({ fields: headers });
    const csvOutput = json2csvParser.parse(allData);
    
    fs.writeFileSync(outputCSVFile, csvOutput);
    console.log('Combined CSV created successfully:', outputCSVFile);
    
    fs.writeFileSync(outputJSONFile, JSON.stringify(allData, null, 2));
    console.log('Combined JSON created successfully:', outputJSONFile);
}
