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
    await page.goto('http://node:8080/auth/google');
    await page.waitForSelector('#identifierId');
    await testBase.assertInSourceCode(page, 'accounts.google.com signin page', 'google-login-page');
  }
  catch (error) {
    await testBase.showError(error, browser);
  }
  await browser.close();
});
