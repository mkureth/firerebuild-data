const fs = require('fs');
//const fs = require('fs').promises; // Use the promise-based API for async operations
const path = require('path');
const csv = require('csv-parser');
const { parse } = require('json2csv');

const sourceFolder = path.join(__dirname, 'data/main-csv');
const destinationFolder = path.join(__dirname, 'data/main-csvdate');
const folderPath = path.join(__dirname, 'data/main-csvdate');

/*
async function copyFolderRecursive(src, dest) {
  try {
    // Check if the source directory exists
    const srcStats = await fs.stat(src);
    if (!srcStats.isDirectory()) {
      console.error(`Error: Source path "${src}" is not a directory.`);
      process.exit(1); // Exit if source is not a directory
    }

    // Create the destination directory if it doesn't exist
    // recursive: true allows creating parent directories if needed
    await fs.mkdir(dest, { recursive: true });
    console.log(`Ensured destination directory "${dest}" exists.`);

    // Read the contents of the source directory
    const entries = await fs.readdir(src, { withFileTypes: true });

    // Iterate over each entry (file or directory) in the source
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        // If the entry is a directory, recursively call the function
        console.log(`Copying directory: "${srcPath}" to "${destPath}"`);
        await copyFolderRecursive(srcPath, destPath);
      } else {
        // If the entry is a file, copy it
        console.log(`Copying file: "${srcPath}" to "${destPath}"`);
        await fs.copyFile(srcPath, destPath);
      }
    }

    console.log(`Successfully copied contents from "${src}" to "${dest}".`);

  } catch (error) {
    console.error(`An error occurred during the copy process: ${error.message}`);
    // Depending on requirements, you might want to exit or handle the error differently
    process.exit(1);
  }
}
*/

//console.log(`Starting copy from "${sourceFolder}" to "${destinationFolder}"...`);
//copyFolderRecursive(sourceFolder, destinationFolder);

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
                row[keys[0]] = `${filePrefix}|${row[keys[0]]}`;
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
