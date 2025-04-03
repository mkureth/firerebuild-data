const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.fire.ca.gov/incidents/2025/1/7/palisades-fire/updates/';
const OUTPUT_DIR = './data/html';

async function scrapeUpdates() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Extract links to updates
    const updateLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.detail-page a')).map(a => {
            const url = new URL(a.href, document.baseURI).href;
            const guid = url.split('/').pop(); // Extract GUID from URL
            return {
                url,
                guid,
                text: a.textContent.trim()
            };
        });
    });

    console.log(`Found ${updateLinks.length} updates.`);
    
    for (const { url, guid, text } of updateLinks) {
        console.log(`Fetching: ${url}`);
        const updatePage = await browser.newPage();
        await updatePage.goto(url, { waitUntil: 'networkidle2' });
        const htmlContent = await updatePage.content();
        
        // Generate a valid filename with GUID prefix
        const filename = path.join(OUTPUT_DIR, `${guid}_${text.replace(/[^a-z0-9]/gi, '_')}.html`);
        fs.writeFileSync(filename, htmlContent);
        console.log(`Saved: ${filename}`);
        
        await updatePage.close();
    }
    
    await browser.close();
    console.log('Scraping completed.');
}

scrapeUpdates().catch(console.error);