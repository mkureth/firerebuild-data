const puppeteer = require('puppeteer');
const fs = require('fs');

// Get the user input for the year-month (like 2024-1)
const args = process.argv.slice(2); // Get the arguments from the command line
if (args.length < 1) {
  console.log('Please provide a year-month parameter, e.g., 2024-1');
  process.exit(1);
}

const yearMonth = args[0]; // The user input year-month parameter
const url = `https://www.wunderground.com/history/monthly/us/ca/los-angeles/KLAX/date/${yearMonth}`;

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
const filename = `data/html/${yearMonth}.html`;

// Call the function to download and save the HTML file
downloadHTML(url, filename);

/* RESEARCH
https://api.weather.com/v3/wx/observations/current?apiKey=e1f10a1e78da46f5b10a1e78da96f525&a;geocode=33.96,-118.4&a;units=e&a;language=en-US&a;format=json
https://www.wunderground.com/history/monthly/us/ca/los-angeles/KLAX/date/2024-1
https://www.wunderground.com/history/monthly/us/ca/los-angeles/KLAX/date/2024-1

https://weatherspark.com/download/1705/Download-Los-Angeles-California-United-States-Weather-Data
https://weatherspark.com/h/d/1705/2025/1/20/Historical-Weather-on-Monday-January-20-2025-in-Los-Angeles-California-United-States#Figures-WindSpeed
https://weatherspark.com/h/d/1705/2025/1/7/Historical-Weather-on-Tuesday-January-7-2025-in-Los-Angeles-California-United-States#Figures-WindSpeed
*/