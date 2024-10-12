const { expect } = require('chai');
const fs = require('fs');
const testBase = require('./testBase.js');

it('should redirect to Google authentication', async function () {
  this.timeout(25000);
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({
     headless: true,
     args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  try {
    const page = await browser.newPage();
    console.log('set viewport');
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('https://whatsapp-communication.dcycleproject.org/auth/google');
    await page.waitForSelector('#identifierId');
    await testBase.assertInSourceCode(
      page, 'accounts.google.com signin page', 'google-login-page'
    );
  }
  catch (error) {
    await testBase.showError(error, browser);
  }
  await browser.close();
});

it('should handle failed Google login', async function () {
  this.timeout(25000);
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({
     headless: true,
     args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  try {
    const page = await browser.newPage();
    console.log('set viewport');
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('https://whatsapp-communication.dcycleproject.org/auth/google/callback');

    // Mocking a failed login
    await page.evaluate(() => {
      window.localStorage.setItem('error', 'Login failed');
    });

    // Verify that the user is redirected to the homepage
    await page.goto('https://whatsapp-communication.dcycleproject.org/auth/google-error');
    await page.waitForSelector('.title');
    await testBase.assertInSourceCode(page, 'Login', 'login-page');
  }
  catch (error) {
    await testBase.showError(error, browser);
  }
  await browser.close();
});
