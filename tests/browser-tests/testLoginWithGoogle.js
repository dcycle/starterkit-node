const { expect } = require('chai');
const testBase = require('./testBase.js');

describe('Google Authentication', function () {
  // Set timeout for all tests
  this.timeout(10000);
  let browser;
  let page;

  before(async function () {
    const puppeteer = require('puppeteer');
    // Launch browser with no sandbox and headless mode enabled
    browser = await puppeteer.launch({
      headless: true, // Headless mode is necessary for environments without a display
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--remote-debugging-port=9222']
    });
    page = await browser.newPage();
  });

  after(async function () {
    if (browser) {
      await browser.close();
    }
  });

  it('should redirect to Google for authentication', async function () {
    await page.goto('http://node:8080/auth/google');
    await testBase.screenshot(page, 'auth-google', await page.content());
    // Wait for the URL to change and check if it includes Google login
    await page.waitForNavigation();
    const url = page.url();
    await testBase.screenshot(page, 'accounts.google.com', await page.content());
    expect(url).to.include('accounts.google.com');
  });

  it('should handle Google authentication callback', async function () {
    // Simulate a successful login by visiting the callback URL
    await page.goto('http://node:8080/auth/google/callback?code=mockCode');
    await testBase.screenshot(page, 'auth-google-callback', await page.content());
    // Check if redirected to the homepage
    await page.waitForNavigation();
    const url = page.url();
    expect(url).to.equal('http://node:8080/');
    await testBase.screenshot(page, 'home-from-google-auth', await page.content());
    
    // Check for a welcome message or user info
    const welcomeMessage = await page.$eval('#numusers_wrapper', el => el.textContent); 
    expect(welcomeMessage).to.include('Welcome Test User');
  });

  it('should handle errors during authentication', async function () {
    // Simulate an error during authentication
    await page.goto('http://node:8080/auth/google-error');
    await testBase.screenshot(page, 'auth-google-error', await page.content());

    // Wait for the URL to change and check if it includes /login
    await page.waitForNavigation();
    const url = page.url();
    await testBase.screenshot(page, 'login-google-auth', await page.content());
    expect(url).to.include('/login');
  });
});
