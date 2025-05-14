const fs = require('fs');
const path = require('path');

// Input directories
const inputDirs = [
  './data/json-formatted/KCAMALIB62',
  './data/json-formatted/KCAMALIB87',
  './data/json-formatted/KCAMALIB133',
  './data/json-formatted/KCAPACIF132',
  './data/json-formatted/KCAPACIF208',
  './data/json-formatted/KCAPACIF227',
  './data/json-formatted/KCAPACIF287',
  './data/json-formatted/KCAPACIF320'
];

// Output directory
const outputDir = './data/json-combined';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Helper to read JSON file
function readJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading/parsing ${filePath}:`, err.message);
    return null;
  }
}

// Collect all filenames
const allFilenames = new Set();

for (const dir of inputDirs) {
  if (!fs.existsSync(dir)) {
    console.warn(`Directory not found: ${dir}`);
    continue;
  }

  const files = fs.readdirSync(dir).filter(file => file.endsWith('.json'));
  files.forEach(file => allFilenames.add(file));
}

// Process and combine files
for (const filename of allFilenames) {
  let combined = [];

  for (const dir of inputDirs) {
    const filePath = path.join(dir, filename);
    if (fs.existsSync(filePath)) {
      const data = readJSON(filePath);
      if (Array.isArray(data)) {
        combined = combined.concat(data);
      } else if (data) {
        combined.push(data);
      }
    }
  }

  // Write combined data to output
  const outputPath = path.join(outputDir, filename);
  try {
    fs.writeFileSync(outputPath, JSON.stringify(combined));
    console.log(`Combined file written: ${outputPath}`);
  } catch (err) {
    console.error(`Error writing to ${outputPath}:`, err.message);
  }
}


/*
const fs = require('fs').promises; // Use the promise version of fs for async/await
const path = require('path');

const inputDir = './data/json-formatted/KCAPACIF287';
const outputDir = './data/json-combined';
const outputFileName = 'KCAPACIF287.json';
const outputPath = path.join(outputDir, outputFileName);

async function combineJsonFiles() {
    let combinedData = [];

    try {
        // 1. Ensure the output directory exists
        // { recursive: true } prevents errors if the directory already exists
        await fs.mkdir(outputDir, { recursive: true });
        console.log(`Ensured output directory exists: ${outputDir}`);

        // 2. Read the list of files in the input directory
        const files = await fs.readdir(inputDir);
        console.log(`Found ${files.length} items in ${inputDir}`); // items could be files or directories

        // 3. Process each file
        for (const file of files) {
            const filePath = path.join(inputDir, file);
            const stat = await fs.stat(filePath); // Get file stats to check if it's a file

            // Only process actual files ending with .json
            if (stat.isFile() && path.extname(file).toLowerCase() === '.json') {
                console.log(`Processing file: ${filePath}`);

                try {
                    // Read the file content
                    const fileContent = await fs.readFile(filePath, 'utf8');

                    // Parse the JSON content
                    const jsonData = JSON.parse(fileContent);

                    // Check if the parsed data is an array and combine
                    if (Array.isArray(jsonData)) {
                        combinedData = combinedData.concat(jsonData);
                        console.log(`Successfully added data from ${file}. Total items so far: ${combinedData.length}`);
                    } else {
                        console.warn(`Skipping file ${file}: Content is not a JSON array.`);
                    }

                } catch (readParseError) {
                    console.error(`Error reading or parsing file ${file}:`, readParseError);
                    // Continue to the next file even if one fails
                }
            } else if (!stat.isFile()) {
                 console.log(`Skipping directory/non-file item: ${file}`);
            } else { // not .json and not a directory
                 console.log(`Skipping non-json file: ${file}`);
            }
        }

        // 4. Write the combined data to the output file
        console.log(`Finished processing files. Writing combined data (${combinedData.length} items) to ${outputPath}`);
        // Use JSON.stringify with null, 2 for pretty-printing the output
        await fs.writeFile(outputPath, JSON.stringify(combinedData), 'utf8');

        console.log('JSON files combined successfully!');
        console.log(`Output file saved at: ${outputPath}`);
        console.log(`Total items combined: ${combinedData.length}`);


    } catch (mainError) {
        console.error('An error occurred during the combination process:', mainError);
        if (mainError.code === 'ENOENT') {
            console.error(`Error: Input directory not found: ${inputDir}`);
        }
    }
}

// Execute the function
combineJsonFiles();
*/