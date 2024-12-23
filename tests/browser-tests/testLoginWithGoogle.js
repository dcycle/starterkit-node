const { expect } = require('chai');
const testBase = require('./testBase.js');

it('should redirect to Google for authentication', async function () {
  try{
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    console.log('Testing ' + __filename);
    const page = await browser.newPage();
    console.log('set viewport');
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto('http://node:8080/auth/google');
    // Wait for the URL to change and check if it includes Google login
    await page.waitForNavigation();
    const url = page.url();
    await testBase.screenshot(page, 'accounts.google.com', await page.content());
    expect(url).to.include('accounts.google.com');
  }
  catch (error) {
    await testBase.showError(error, browser);
  }
  await browser.close();
});

it('should handle Google authentication callback', async function () {
  try{
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    console.log('Testing ' + __filename);
    const page = await browser.newPage();
    console.log('set viewport');
    await page.setViewport({ width: 1280, height: 800 });

    // Simulate a successful login by visiting the callback URL
    await page.goto('http://node:8080/auth/google/callback?code=mockCode');
    // Check if redirected to the homepage
    await page.waitForNavigation();
    const url = page.url();
    expect(url).to.equal('http://node:8080/');
    await testBase.screenshot(page, 'home-from-google-auth', await page.content());
    // Check for a welcome message or user info
    const welcomeMessage = await page.$eval('#numusers_wrapper', el => el.textContent); 
    expect(welcomeMessage).to.include('Welcome Test User');
  }
  catch (error) {
    await testBase.showError(error, browser);
  }
  await browser.close();
});

it('should handle errors during authentication', async function () {
  try {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('Testing ' + __filename);
    const page = await browser.newPage();
    console.log('set viewport');
    await page.setViewport({ width: 1280, height: 800 });
    // Simulate an error during authentication
    await page.goto('http://node:8080/auth/google-error');
    // Wait for the URL to change and check if it includes /login
    await page.waitForNavigation();
    const url = page.url();
    await testBase.screenshot(page, 'login-google-auth', await page.content());
    expect(url).to.include('/login');
  }
  catch (error) {
    await testBase.showError(error, browser);
  }
  await browser.close();
});
