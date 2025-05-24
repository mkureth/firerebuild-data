const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// File paths
const inputPath = path.resolve(__dirname, '../../../data/SOURCE/weather/stations/stations.json');
const outputJsonPath = path.resolve(__dirname, '../../../deploy/content/palisades-fire-weather-report/reports/weather-stations-details/files/stations.json');
const outputCsvPath = path.resolve(__dirname, '../../../deploy/content/palisades-fire-weather-report/reports/weather-stations-details/files/stations.csv');

// Reference points
const fireLat = 34.07901, fireLng = -118.5591;
const kcatopanLat = 34.0837306, kcatopanLng = -118.5995221;
const klaxLat = 33.9416, klaxLng = -118.4085;

// List of anomaly stations
const anomalyStations = new Set([
    'KCALOSAN842',
    'KCASANTA4733',
    'KCASANTA630',
    'KCATOPAN8'
]);

// Haversine formula to calculate distance in miles
function haversineDistance(lat1, lng1, lat2, lng2) {
    const toRad = (x) => x * Math.PI / 180;
    const R = 3958.8; // Earth radius in miles

    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

// Load and process stations
const stations = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

const enrichedStations = stations.map(station => {
    const lat = parseFloat(station.Lat);
    const lng = parseFloat(station.Lng);

    const fireDistance = haversineDistance(lat, lng, fireLat, fireLng);
    const kcatopanDistance = haversineDistance(lat, lng, kcatopanLat, kcatopanLng);
    const klaxDistance = haversineDistance(lat, lng, klaxLat, klaxLng);

    return {
        StationCode: station.StationCode,
        StationName: station.StationName,
        StationFullAddress: station.StationFullAddress,
        Lat: station.Lat,
        Lng: station.Lng,
        FireDistanceMiles: fireDistance.toFixed(2),
        KCATOPANDistanceMiles: kcatopanDistance.toFixed(2),
        KLAXDistanceMiles: klaxDistance.toFixed(2),
        Anomaly: anomalyStations.has(station.StationCode)
    };
});

// Write to JSON
fs.writeFileSync(outputJsonPath, JSON.stringify(enrichedStations, null, 2), 'utf8');

// Write to CSV
const csvWriter = createCsvWriter({
    path: outputCsvPath,
    header: [
        {id: 'StationCode', title: 'StationCode'},
        {id: 'StationName', title: 'StationName'},
        {id: 'StationFullAddress', title: 'StationFullAddress'},
        {id: 'Lat', title: 'Lat'},
        {id: 'Lng', title: 'Lng'},
        {id: 'FireDistanceMiles', title: 'FireDistanceMiles'},
        {id: 'KCATOPANDistanceMiles', title: 'KCATOPANDistanceMiles'},
        {id: 'KLAXDistanceMiles', title: 'KLAXDistanceMiles'},
        {id: 'Anomaly', title: 'Anomaly'}
    ]
});

csvWriter.writeRecords(enrichedStations)
    .then(() => console.log('CSV file written successfully.'))
    .catch(err => console.error('Error writing CSV:', err));
