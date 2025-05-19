const fs = require('fs');
const path = require('path');

const rawDataDir = './data/station-json-raw';
const cleanDataDir = './data/station-json-clean';

// Ensure the clean data directory exists
if (!fs.existsSync(cleanDataDir)) {
    fs.mkdirSync(cleanDataDir, { recursive: true });
}

/**
 * Recursively searches an object for a specific nested key pattern and condition.
 * @param {object} obj - The object to search within.
 * @param {string} keyToFind - The specific key name to find (e.g., 'observations').
 * @param {function} condition - A function that takes the value of the key and returns true if it meets the condition.
 * @returns {Array|null} The value of the key if found and the condition is met, otherwise null.
 */
function findNestedKeyWithCondition(obj, keyToFind, condition) {
    if (typeof obj !== 'object' || obj === null) {
        return null;
    }

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];

            // Check for the pattern [key].b.observations
            if (key === 'b' && typeof value === 'object' && value !== null && value.hasOwnProperty(keyToFind)) {
                const observations = value[keyToFind];
                if (condition(observations)) {
                    return observations;
                }
            }

            // Recursively search in nested objects
            const found = findNestedKeyWithCondition(value, keyToFind, condition);
            if (found) {
                return found;
            }
        }
    }

    return null;
}

fs.readdir(rawDataDir, (err, files) => {
    if (err) {
        console.error(`Error reading directory ${rawDataDir}:`, err);
        return;
    }

    files.forEach(file => {
        if (path.extname(file) === '.json') {
            const filePath = path.join(rawDataDir, file);

            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error(`Error reading file ${filePath}:`, err);
                    return;
                }

                try {
                    const jsonObject = JSON.parse(data);

                    const observationsArray = findNestedKeyWithCondition(
                        jsonObject,
                        'observations',
                        (value) => Array.isArray(value) && value.length > 3
                    );

                    if (observationsArray) {
                        const outputFilePath = path.join(cleanDataDir, file);
                        //const dataToSave = JSON.stringify(observationsArray, null, 2);
                        const dataToSave = JSON.stringify(observationsArray);

                        fs.writeFile(outputFilePath, dataToSave, 'utf8', (err) => {
                            if (err) {
                                console.error(`Error writing file ${outputFilePath}:`, err);
                            } else {
                                console.log(`Successfully processed and saved data from ${file}`);
                            }
                        });
                    } else {
                        console.log(`No matching 'observations' array found in ${file} or condition not met.`);
                    }

                } catch (parseErr) {
                    console.error(`Error parsing JSON file ${filePath}:`, parseErr);
                }
            });
        }
    });
});