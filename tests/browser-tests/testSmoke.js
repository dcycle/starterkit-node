const { expect } = require('chai');
const fs = require('fs');
const testBase = require('./testBase.js');

it('It should be possible to log in and edit a node', async function() {
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
    await testBase.assertInSourceCode(page, 'Hello world');
    await testBase.screenshot(page, 'home', await page.content());
  }
  catch (error) {
    await testBase.showError(error, browser);
  }
  await browser.close();
});
