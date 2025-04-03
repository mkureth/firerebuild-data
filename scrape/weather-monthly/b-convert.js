//https://www.wunderground.com/history/monthly/us/ca/los-angeles/KLAX/date/1935-3

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Directory path containing your HTML files
const directoryPath = './data/test'; // Change this to your directory path

// Function to extract table data from tbody
const extractTableData = (html) => {
    const $ = cheerio.load(html);
    const table = $('div.observation-table table');

    if (!table.length) {
        console.error('No observation table found');
        return null;
    }

    let rows = [];

    // Extract data from <tbody>, handling nested tables
    table.find('tbody tr').each((_, row) => {
        let rowHolder = [];
        $(row)
            .find('td')
            .each((_, cell) => {
                const nestedTable = $(cell).find('table');
                if (nestedTable.length) {
                    let rowData = [];
                    nestedTable.find('tr').each((_, nestedRow) => {
                        const nestedRowData = $(nestedRow)
                            .find('td')
                            .map((_, nestedCell) => $(nestedCell).text().trim())
                            .get();
                        rowData.push(nestedRowData);
                    });
                    rowHolder.push(rowData);
                }
            });

        if (rowHolder.length > 0) {
            rows = rowHolder;
        }
    });

    rows = rows[0].map((_, i) => 
      [...rows[0][i], 
      ...rows[1][i], 
      ...rows[2][i],
      ...rows[3][i],
      ...rows[4][i],
      ...rows[5][i],
      ...rows[6][i]
      ]
    );

    rows[0] = ['Date', 'Temperature Max', 'Temperature Avg', 'Temperature Min', 'Dew Point Max', 'Dew Point Avg', 'Dew Point Min', 'Humidity Max', 'Humidity Avg', 'Humidity Min', 'Wind Speed Max', 'Wind Speed Avg', 'Wind Speed Min', 'Pressure Max', 'Pressure Avg', 'Pressure Min', 'Total Precipitation Inches'];
    return rows;
};

// Function to convert extracted data to JSON
const convertToJson = (rows) => {
    return rows.map((row, index) => ({ id: index + 1, data: row }));
};

// Function to save JSON file
const saveToJson = (fileName, jsonData) => {
    const jsonFileName = path.join(directoryPath, path.basename(fileName, '.html') + '.json');
    fs.writeFileSync(jsonFileName, JSON.stringify(jsonData, null, 2));
    console.log(`JSON saved: ${jsonFileName}`);
};

// Function to convert extracted data to CSV
const convertToCSV = (rows) => {
    return rows.map(row => row.join(',')).join('\n');
};

// Function to save CSV file
const saveToCSV = (fileName, csvContent) => {
    const csvFileName = path.join(directoryPath, path.basename(fileName, '.html') + '.csv');
    fs.writeFileSync(csvFileName, csvContent);
    console.log(`CSV saved: ${csvFileName}`);
};

// Read all HTML files in the specified directory
fs.readdir(directoryPath, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    files.forEach((file) => {
        const filePath = path.join(directoryPath, file);

        if (path.extname(file) === '.html') {
            fs.readFile(filePath, 'utf8', (err, html) => {
                if (err) {
                    console.error('Error reading file:', err);
                    return;
                }

                const tableData = extractTableData(html);
                if (!tableData) return;

                //const jsonData = convertToJson(tableData);
                //saveToJson(filePath, jsonData);

                const csvContent = convertToCSV(tableData);
                saveToCSV(filePath, csvContent);
            });
        }
    });
});
