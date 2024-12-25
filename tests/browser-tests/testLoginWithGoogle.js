const { expect } = require('chai');
const testBase = require('./testBase.js');

// Increase timeout to 10 seconds (10000ms)
describe('Google Authentication', function () {
  this.timeout(10000); // Set timeout for all tests

  let browser;
  let page;

  before(async function () {
    const puppeteer = require('puppeteer');
    browser = await puppeteer.launch({
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
    await page.goto('http://node:8080/auth/google', { waitUntil: 'networkidle2' });
    // Log current URL
    console.log('Page loaded, current URL:', await page.url());
    await testBase.screenshot(page, 'auth-google2', await page.content());
    // Wait for navigation
    // await page.waitForNavigation({ timeout: 5000 });
    const url = page.url();
    console.log('Post-navigation URL:', url);  // Log the URL after navigation

    await testBase.screenshot(page, 'accounts.google.com', await page.content());
    expect(url).to.include('accounts.google.com');
  });

  it('should handle errors during authentication', async function () {
    await page.goto('http://node:8080/auth/google-error', { waitUntil: 'networkidle2' });
    // Log current URL
    console.log('Page loaded, current URL:', await page.url());
    await testBase.screenshot(page, 'auth-google-error2', await page.content());

    const url = page.url();
    await testBase.screenshot(page, 'login-google-auth', await page.content());
    expect(url).to.include('/login');
  });
});
