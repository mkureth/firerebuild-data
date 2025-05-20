const puppeteer = require('puppeteer');
const fs = require('fs');

// Get the user input for the year-month (like 2024-1-1)
const args = process.argv.slice(2); // Get the arguments from the command line
if (args.length < 1) {
  console.log('Please provide a year-month parameter, e.g., 2024-1-1');
  process.exit(1);
}

const weatherStation = args[0];
const yearMonthDay = args[1]; // The user input year-month parameter
//const url = `https://www.wunderground.com/history/daily/us/ca/los-angeles/KLAX/date/${yearMonthDay}`;
const url = `https://www.wunderground.com/dashboard/pws/${weatherStation}/table/${yearMonthDay}/${yearMonthDay}/daily`;


// Function to fetch and save the HTML file
const downloadHTML = async (url, filename) => {
  const browser = await puppeteer.launch(); // Launch a headless browser
  const page = await browser.newPage(); // Open a new page

  try {
    await page.goto(url, { waitUntil: 'networkidle0' }); // Wait until the page is fully loaded
    const html = await page.content(); // Get the HTML content of the page

    // Save the HTML content to a file
    fs.writeFileSync(filename, html, 'utf8');
    console.log(`HTML content saved as ${filename}`);
  } catch (error) {
    console.error('Error downloading HTML:', error);
  } finally {
    await browser.close(); // Close the browser when done
  }
};

// Generate the filename based on the user input (e.g., 2024-1.html)
const filename = `data/station-html/${weatherStation}--${yearMonthDay}.html`;

// Call the function to download and save the HTML file
downloadHTML(url, filename);

/* RESEARCH

KCAPACIF287 Alphabet Streets
KCALOSAN1231  Bel Air
KCALOSAN902 Bel Air
KCABEVER36  Benedict Canyon/Mulholland
KCALOSAN1246  Beverly Crest
KCALOSAN724 Brentwood
KCALOSAN1017  Brentwood
KCALOSAN895 Brentwood
KCALOSAN938 Brentwood
KCAMALIB166 Broad Beach
KCACALAB70  Calabasas Highlands
KCALOSAN872 Del Rey
KCAENCIN812 Encino
KCATOPAN68  Fernwood
KCATOPAN8 L.A.Co.F.D. Helistop 69Bravo
KCAMALIB140 Latigo Canyon
KCAMALIB162 Latigo Canyon
KCALOSAN803 Lower Bel Air
KCAMALIB108 Malibu
KCAMALIB114 Malibu
KCAMALIB147 Malibu
KCAMALIB87  Malibu
KCAMALIB62  Malibu Country Estates
KCAMALIB61  Malibu Springs - Vedder
KCALOSAN364 Mar Vista Hill
KCAWOODL8 Mulholland Dr. and Canoga Ave.
KCAVENIC20  Oakwood Pentagon
KCASANTA3310  Ocean Park
KCAPACIF208 Pacific Palisades
KCAPACIF227 Pacific Palisades
KCAPACIF272 Pacific Palisades
KCAPACIF320 Pacific Palisades
KCAPACIF132 Palisades Country Estates
KCASANTA4210  Pico
KCASANTA4733  Pico
KCAMALIB151 Point Dume
KCAPACIF367 Riviera
KCASANTA4447  Rustic Canyon
KCAAGOUR101 Santa Monica Mountains
KCACALAB72  Santa Monica Mountains
KCAMALIB110 Santa Monica Mountains
KCAMALIB158 Santa Monica Mountains
KSMO  Santa Monica Muni
KCALOSAN1201  Sawtelle
KCALOSAN842 Sawtelle
KCASANTA630 SM/Brentwood
KCAMALIB52  Tapia Reclamation Facility
KCASANTA4711  The Palisades
KCATOPAN28  Topanga
KCATOPAN31  Topanga
KCATOPAN32  Topanga
KCATOPAN40  Topanga
KCATOPAN43  Topanga
KCATOPAN47  Topanga
KCATOPAN52  Topanga
KCATOPAN55  Topanga
KCATOPAN62  Topanga
KCALOSAN1130  West Los Angeles
KCASANTA4632  Wilshire
KCASANTA2881  Wilshire/Montana
KTOA  Zamperini Fld



https://www.wunderground.com/dashboard/pws/KCAMALIB62/table/2015-08-31/2015-08-31/monthly
https://www.wunderground.com/dashboard/pws/KCAMALIB87/table/2015-08-31/2015-08-31/monthly
https://www.wunderground.com/dashboard/pws/KCAMALIB133/table/2015-08-31/2015-08-31/monthly
https://www.wunderground.com/dashboard/pws/KCAPACIF132/table/2015-08-31/2015-08-31/monthly
https://www.wunderground.com/dashboard/pws/KCAPACIF287/table/2015-08-31/2015-08-31/monthly
https://www.wunderground.com/dashboard/pws/KCAPACIF227/table/2015-08-31/2015-08-31/monthly
https://www.wunderground.com/dashboard/pws/KCAPACIF208/table/2015-08-31/2015-08-31/monthly
https://www.wunderground.com/dashboard/pws/KCAPACIF320/table/2015-08-31/2015-08-31/monthly

---

LAX
https://www.wunderground.com/history/daily/us/ca/malibu/KCAMALIB62/date/2024-1-1
https://www.wunderground.com/history/daily/us/ca/malibu/KCAMALIB87/date/2024-1-1
https://www.wunderground.com/history/daily/us/ca/malibu/KCAMALIB133/date/2024-1-1
https://www.wunderground.com/history/daily/us/ca/pacific-palisades/KCAPACIF132/date/2024-1-1
https://www.wunderground.com/history/daily/us/ca/pacific-palisades/KCAPACIF287/date/2024-1-1
https://www.wunderground.com/history/daily/us/ca/pacific-palisades/KCAPACIF227/date/2024-1-1
https://www.wunderground.com/history/daily/us/ca/pacific-palisades/KCAPACIF208/date/2024-1-1
https://www.wunderground.com/history/daily/us/ca/pacific-palisades/KCAPACIF320/date/2024-1-1

---

https://www.wunderground.com/weather/us/ca/malibu/KCAMALIB62
https://www.wunderground.com/dashboard/pws/KCAMALIB62/table/2025-01-7/2025-01-7/daily

https://www.wunderground.com/weather/us/ca/malibu/KCAMALIB87
https://www.wunderground.com/dashboard/pws/KCAMALIB87/table/2025-01-7/2025-01-7/daily

https://www.wunderground.com/weather/us/ca/malibu/KCAMALIB133
https://www.wunderground.com/dashboard/pws/KCAMALIB133/table/2025-01-7/2025-01-7/daily

https://www.wunderground.com/weather/us/ca/pacific-palisades/KCAPACIF132
https://www.wunderground.com/dashboard/pws/KCAPACIF132/table/2025-01-7/2025-01-7/daily

https://www.wunderground.com/weather/us/ca/pacific-palisades/KCAPACIF287
https://www.wunderground.com/dashboard/pws/KCAPACIF287/table/2025-01-7/2025-01-7/daily

https://www.wunderground.com/weather/us/ca/pacific-palisades/KCAPACIF227
https://www.wunderground.com/dashboard/pws/KCAPACIF227/table/2025-01-7/2025-01-7/daily

https://www.wunderground.com/weather/us/ca/pacific-palisades/KCAPACIF208
https://www.wunderground.com/dashboard/pws/KCAPACIF208/table/2025-01-7/2025-01-7/daily

https://www.wunderground.com/weather/us/ca/pacific-palisades/KCAPACIF320
https://www.wunderground.com/dashboard/pws/KCAPACIF320/table/2025-01-7/2025-01-7/daily


https://www.wunderground.com/dashboard/pws/KCALOSAN958/table/2025-01-7/2025-01-7/daily

node a-download.js KCALOSAN958 2018-11-07

*/



/*
COMMANDS
node a-download.js KCAPACIF287 2025-01-07
node a-download.js KCALOSAN1231 2025-01-07
node a-download.js KCALOSAN902 2025-01-07
node a-download.js KCABEVER36 2025-01-07
node a-download.js KCALOSAN1246 2025-01-07
node a-download.js KCALOSAN724 2025-01-07
node a-download.js KCALOSAN1017 2025-01-07
node a-download.js KCALOSAN895 2025-01-07
node a-download.js KCALOSAN938 2025-01-07
node a-download.js KCAMALIB166 2025-01-07
node a-download.js KCACALAB70 2025-01-07
node a-download.js KCALOSAN872 2025-01-07
node a-download.js KCAENCIN812 2025-01-07
node a-download.js KCATOPAN68 2025-01-07
node a-download.js KCATOPAN8 2025-01-07
node a-download.js KCAMALIB140 2025-01-07
node a-download.js KCAMALIB162 2025-01-07
node a-download.js KCALOSAN803 2025-01-07
node a-download.js KCAMALIB108 2025-01-07
node a-download.js KCAMALIB114 2025-01-07
node a-download.js KCAMALIB147 2025-01-07
node a-download.js KCAMALIB87 2025-01-07
node a-download.js KCAMALIB62 2025-01-07
node a-download.js KCAMALIB61 2025-01-07
node a-download.js KCALOSAN364 2025-01-07
node a-download.js KCAWOODL8 2025-01-07
node a-download.js KCAVENIC20 2025-01-07
node a-download.js KCASANTA3310 2025-01-07
node a-download.js KCAPACIF208 2025-01-07
node a-download.js KCAPACIF227 2025-01-07
node a-download.js KCAPACIF272 2025-01-07
node a-download.js KCAPACIF320 2025-01-07
node a-download.js KCAPACIF132 2025-01-07
node a-download.js KCASANTA4210 2025-01-07
node a-download.js KCASANTA4733 2025-01-07
node a-download.js KCAMALIB151 2025-01-07
node a-download.js KCAPACIF367 2025-01-07
node a-download.js KCASANTA4447 2025-01-07
node a-download.js KCAAGOUR101 2025-01-07
node a-download.js KCACALAB72 2025-01-07
node a-download.js KCAMALIB110 2025-01-07
node a-download.js KCAMALIB158 2025-01-07
node a-download.js KCALOSAN1201 2025-01-07
node a-download.js KCALOSAN842 2025-01-07
node a-download.js KCASANTA630 2025-01-07
node a-download.js KCAMALIB52 2025-01-07
node a-download.js KCASANTA4711 2025-01-07
node a-download.js KCATOPAN28 2025-01-07
node a-download.js KCATOPAN31 2025-01-07
node a-download.js KCATOPAN32 2025-01-07
node a-download.js KCATOPAN40 2025-01-07
node a-download.js KCATOPAN43 2025-01-07
node a-download.js KCATOPAN47 2025-01-07
node a-download.js KCATOPAN52 2025-01-07
node a-download.js KCATOPAN55 2025-01-07
node a-download.js KCATOPAN62 2025-01-07
node a-download.js KCALOSAN1130 2025-01-07
node a-download.js KCASANTA4632 2025-01-07
node a-download.js KCASANTA2881 2025-01-07


node a-download.js KSMO 2025-01-07
node a-download.js KLAX 2025-01-07
node a-download.js KTOA 2025-01-07

https://www.wunderground.com/history/daily/us/ca/los-angeles/KLAX/date/2025-1-7
https://www.wunderground.com/history/daily/us/ca/los-angeles/KSMO/date/2025-1-7
https://www.wunderground.com/history/daily/us/ca/los-angeles/KTOA/date/2025-1-7
*/