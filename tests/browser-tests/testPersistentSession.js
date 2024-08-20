const { expect } = require('chai');
const fs = require('fs');
const testBase = require('./testBase.js');

it('Sessions should persist even if the application restarts', async function() {
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
    await page.goto('http://node:8080/login');

    await page.type('[name=username]', 'admin');
    await page.type('[name=password]', process.env.ADMIN_PASSWORD);
    await page.keyboard.press('Enter');
    await page.waitForSelector('#message');

    let errorExpectedOnCrash = false;
    // Crash the application
    try {
      await page.goto('http://node:8080/dev/crash/' + process.env.CRASHTEST_TOKEN);
    }
    catch (error) {
      errorExpectedOnCrash = true;
    }

    /* jshint ignore:start */
    expect(errorExpectedOnCrash).to.be.true;
    /* jshint ignore:end */

    // Wait a few seconds for the application to restart
    await testBase.sleep(3000);

    // Go to the home page and make sure we are still logged in
    await page.goto('http://node:8080');
    await page.waitForSelector('#message');

  }
  catch (error) {
    await testBase.showError(error, browser);
  }
  await browser.close();
});
