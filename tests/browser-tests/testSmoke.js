const { expect } = require('chai');
const fs = require('fs');
const testBase = require('./testBase.js');

it('It should be possible to log in and see the app', async function() {
  this.timeout(25000);
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({
     headless: true,
     args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  var result = false;
  try {
    console.log('Testing ' + __filename);
    const page = await browser.newPage();
    console.log('set viewport');
    await page.setViewport({ width: 1280, height: 800 });
    console.log('go to the home page');
    await page.goto('http://node:8080');

    await page.type('[name=username]', 'admin');
    await page.type('[name=password]', process.env.ADMIN_PASSWORD);
    await page.keyboard.press('Enter');
    await page.waitForSelector('#messages');

    await testBase.assertInSourceCode(page, 'Send Message');
    await testBase.screenshot(page, 'home', await page.content());
  }
  catch (error) {
    await testBase.showError(error, browser);
  }
  await browser.close();
});
