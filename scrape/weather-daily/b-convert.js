const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { parse } = require('json2csv');

const inputDir = './data/html';  // Folder containing HTML files
const outputDir = './data/csv';  // Folder to save CSV files

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Function to extract text from a cell, including nested elements like <span>
function extractCellText(cell) {
    return cheerio(cell).find('*').not('script, style').contents().map((_, el) => {
        return cheerio(el).text().trim();
    }).get().join(' ').replace(/\s+/g, ' '); // Trim and remove extra spaces
}

// Function to extract table data
function extractTableData(html) {
    const $ = cheerio.load(html);
    const table = $('div.observation-table.ng-star-inserted');

    if (!table.length) {
        console.log('No table found in the file.');
        return null;
    }

    // Extract headers from <thead>
    const headers = [];
    table.find('thead tr th').each((_, el) => {
        headers.push($(el).text().trim());
    });

    if (headers.length === 0) {
        console.log('No headers found.');
        return null;
    }

    // Extract rows
    const data = [];
    table.find('tbody tr').each((_, row) => {
        const rowData = {};
        $(row).find('td').each((i, cell) => {
            //rowData.push($(cell).text().trim());
            rowData[headers[i]] = $(cell).text().trim(); // Map cell text to corresponding header
        });
        data.push(rowData);
    });

    return { headers, data };
}

// Function to process all HTML files
function processHtmlFiles() {
    const files = fs.readdirSync(inputDir).filter(file => file.endsWith('.html'));

    if (files.length === 0) {
        console.log('No HTML files found.');
        return;
    }

    files.forEach(file => {
        const filePath = path.join(inputDir, file);
        const html = fs.readFileSync(filePath, 'utf-8');

        const tableData = extractTableData(html);
        if (tableData && tableData.data.length > 0) {
            const csvFileName = path.join(outputDir, file.replace('.html', '.csv'));
            const csv = parse(tableData.data, { fields: tableData.headers });
            fs.writeFileSync(csvFileName, csv, 'utf-8');
            console.log(`CSV saved: ${csvFileName}`);
        } else {
            console.log(`No data found in: ${file}`);
        }
    });
}

// Run the script
processHtmlFiles();