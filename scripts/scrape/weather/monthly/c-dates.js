const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { parse } = require('json2csv');

const folderPath = path.join(__dirname, 'csvtest');

fs.readdir(folderPath, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    files.filter(file => path.extname(file) === '.csv').forEach(file => {
        const filePath = path.join(folderPath, file);
        const newRows = [];
        const filePrefix = path.basename(file, '.csv');
        
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                const keys = Object.keys(row);
                row[keys[0]] = `${filePrefix}-${row[keys[0]]}`;
                newRows.push(row);
            })
            .on('end', () => {
                const csvData = parse(newRows);
                fs.writeFile(filePath, csvData, (err) => {
                    if (err) {
                        console.error('Error writing file:', err);
                    } else {
                        console.log(`Updated file saved: ${file}`);
                    }
                });
            });
    });
});
