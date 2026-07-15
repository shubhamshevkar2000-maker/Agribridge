const { chromium } = require('playwright');
const http = require('http');

const API = 'http://localhost:5000/api';

async function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const req = http.request(API + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, (res) => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(resData)); } catch(e) { resolve(resData); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runTest() {
  console.log("Setting up auction test...");

  // 1. Create Users
  const fPhone = '999' + Math.floor(Math.random() * 9000000);
  const b1Phone = '998' + Math.floor(Math.random() * 9000000);
  const b2Phone = '997' + Math.floor(Math.random() * 9000000);

  let f1 = await request('POST', '/auth/signup', { name: 'Auction Farmer', phone: fPhone, password: 'password', role: 'farmer' });
  let b1 = await request('POST', '/auth/signup', { name: 'Buyer Alice', phone: b1Phone, password: 'password', role: 'buyer' });
  let b2 = await request('POST', '/auth/signup', { name: 'Buyer Bob', phone: b2Phone, password: 'password', role: 'buyer' });

  const f1Token = f1.data.token;
  const b1Token = b1.data.token;
  const b2Token = b2.data.token;

  // 2. Create Crop & Auction
  const crop = await request('POST', '/crops', { name: 'Test Corn', category: 'Grains', quantity: 50, unit: 'Quintals', pricePerUnit: 1000, status: 'listed' }, f1Token);
  console.log("Crop Response:", crop);
  const cropId = crop.data._id;
  
  // Set auction to close in 1.5 minutes
  const auction = await request('POST', '/auctions', { cropId, startingBid: 1000, durationMinutes: 1.5 }, f1Token);
  console.log("Auction Response:", auction);
  const auctionId = auction.data._id;

  console.log(`Auction created! ID: ${auctionId}`);
  console.log("Starting Playwright browsers...");

  // Start two separate browser contexts
  const browser = await chromium.launch({ headless: true });
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();

  const page1 = await context1.newPage();
  const page2 = await context2.newPage();

  // Inject localStorage tokens
  await page1.goto('http://localhost:3000');
  await page1.evaluate((token) => localStorage.setItem('token', token), b1Token);
  
  await page2.goto('http://localhost:3000');
  await page2.evaluate((token) => localStorage.setItem('token', token), b2Token);

  console.log("Navigating to auction pages...");
  
  // LOG BACKEND CALL
  const res = await request('GET', `/auctions/${auctionId}`, null, b1Token);
  console.log("TEST: /auctions/id fetch gave:", res);
  
  page1.on('console', msg => console.log('PAGE1 LOG:', msg.text()));
  await page1.goto(`http://localhost:3000/buyer/auctions/${auctionId}`);
  const storedToken = await page1.evaluate(() => localStorage.getItem('token'));
  console.log("Buyer 1 token in browser:", storedToken ? "Exists" : "Missing");
  await page2.goto(`http://localhost:3000/buyer/auctions/${auctionId}`);

  await page1.waitForTimeout(3000);

  // Buyer 1 bids 1100
  console.log("Buyer 1 bidding 1100...");
  await page1.fill('input[type="number"]', '1100');
  await page1.click('button:has-text("Bid Now")');
  await page1.waitForTimeout(2000);
  
  // Check if Buyer 2 sees 1100
  const b2Highest = await page2.locator('.text-2xl.font-bold.font-mono.text-foreground').nth(1).innerText();
  console.log("Buyer 2 sees highest bid:", b2Highest);

  // Buyer 2 bids 1500
  console.log("Buyer 2 bidding 1500...");
  await page2.fill('input[type="number"]', '1500');
  await page2.click('button:has-text("Bid Now")');
  await page2.waitForTimeout(2000);

  // Check if Buyer 1 sees 1500 and the outbid feed
  const b1Highest = await page1.locator('.text-2xl.font-bold.font-mono.text-foreground').nth(1).innerText();
  console.log("Buyer 1 sees highest bid:", b1Highest);

  // Take screenshots
  await page1.screenshot({ path: 'buyer1_outbid.png' });
  await page2.screenshot({ path: 'buyer2_winning.png' });

  console.log("Waiting for auction to close via background worker (approx 1 min)...");
  
  // Wait for 75 seconds to ensure the 10-second interval worker catches the 1.5 min auction 
  // Actually 1.5 mins is 90 seconds. We've used ~10s so far. We'll wait 90 seconds.
  await page1.waitForTimeout(90000);

  // Check final status
  const b1Status = await page1.locator('h3:has-text("Auction Concluded")').isVisible();
  console.log("Did auction conclude on Buyer 1's screen?", b1Status);

  await page1.screenshot({ path: 'buyer1_concluded.png' });
  await page2.screenshot({ path: 'buyer2_concluded.png' });

  await browser.close();

  // Check order creation in backend
  const orders = await request('GET', '/orders', null, b2Token);
  console.log("Buyer 2 orders after auction:", JSON.stringify(orders.data, null, 2));

  console.log("Test finished!");
}

runTest().catch(console.error);
