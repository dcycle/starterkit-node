const { expect } = require('chai');
// const fs = require('fs');
const testBase = require('./testBase.js');

it("anonymous user shouldn't access aadmininstrator roles pages.", async function() {
  this.timeout(50000);
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({
    //  headless: true,
     args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    console.log('Testing ' + __filename);

    // Step 1: Open the dashboard page as an anonymous user
    console.log("Open the dashboard page as an anonymous user");
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://node:8080/dashboardui');

    // Step 3: Verify the page URL redirects to the login page
    const currentUrl = page.url();
    expect(currentUrl).to.include('/login', 'The user should be redirected to the login page.');

  }
  catch (error) {
    await testBase.showError(error, browser);
  }
  await browser.close();
});


it("authenticated only user shouldn't access aadmininstrator roles pages.", async function() {
  this.timeout(50000);
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({
    //  headless: true,
     args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    console.log('Testing ' + __filename);
    // Step 1: Login as xyz in browser 1 and generate merge token
    console.log("Login as xyz in browser 1 and generate token");
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://node:8080');

    await page.type('[name=username]', 'xyz');
    await page.type('[name=password]', process.env.XYZ_PASSWORD);
    await page.keyboard.press('Enter');

    await page.waitForSelector('#messages');
    await page.goto('http://node:8080/dashboardui');

    const currentUrl = page.url();
    expect(currentUrl).to.include('/login', 'The user should be redirected to the login page.');

  }
  catch (error) {
    await testBase.showError(error, browser);
  }
  await browser.close();
});

it("admin should access aadmininstrator roles pages.", async function() {
  this.timeout(50000);
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({
    //  headless: true,
     args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    console.log('Testing ' + __filename);
    // Step 1: Login as xyz in browser 1 and generate merge token
    console.log("Login as xyz in browser 1 and generate token");
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://node:8080');

    await page.type('[name=username]', 'admin');
    await page.type('[name=password]', process.env.ADMIN_PASSWORD);
    await page.keyboard.press('Enter');
    await page.waitForSelector('#messages');

    await page.goto('http://node:8080/dashboardui');

    console.log("Check the admin dashboard message");
    const bodyContent = await page.evaluate(() => document.body.textContent.trim()); // Get all text content in the body
    expect(bodyContent).to.include('This is where the admin dashboard will be', 'Admin dashboard message not found.');
    
  }
  catch (error) {
    await testBase.showError(error, browser);
  }
  await browser.close();
});

