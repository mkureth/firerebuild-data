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


/*
COMMANDS



*/