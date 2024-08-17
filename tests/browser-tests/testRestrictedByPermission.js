const { expect } = require('chai');
const fs = require('fs');
const testBase = require('./testBase.js');

it('Anonymous user should get 403 for accessing restricted by permissions folder files', async function() {
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
    console.log('go to the xyz access index.html file');
    await page.goto('http://node:8080/private/restricted-by-permission/permission-xyz/access/index.html');

    // Get the status code
    const status = await page.evaluate(() => {
      return document.body.textContent.includes('Sorry, you don\'t have access to xyz files.') ? 403 : 200;
    });

    // Assert status and message
    expect(status).to.equal(403);

    // Check the HTML content
    const content = await page.content();
    expect(content).to.include('Sorry, you don\'t have access to xyz files.');

    const page2 = await browser.newPage();
    console.log('go to the xyz access styles file');
    await page2.goto('http://node:8080/private/restricted-by-permission/permission-xyz/access/styles.css');

    // Get the status code
    const status2 = await page2.evaluate(() => {
      return document.body.textContent.includes('Sorry, you don\'t have access to xyz files.') ? 403 : 200;
    });

    // Assert status and message
    expect(status).to.equal(403);

    // Check the HTML content
    const content2 = await page2.content();
    expect(content2).to.include('Sorry, you don\'t have access to xyz files.');

  }
  catch (error) {
    await testBase.showError(error, browser);
  }
  await browser.close();
});


it('User with access permission should see the content of restricted by permissions folder files', async function() {
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
    await page.waitForSelector('#messages');

    console.log('Before Updating permission go to the xyz access index.html file');
    await page.goto('http://node:8080/private/restricted-by-permission/permission-xyz/access/index.html');

    // Get the status code
    const status = await page.evaluate(() => {
      return document.body.textContent.includes('Sorry, you don\'t have access to xyz files.') ? 403 : 200;
    });

    // Assert status and message
    expect(status).to.equal(403);

    // Check the HTML content
    const content2 = await page.content();
    expect(content2).to.include('Sorry, you don\'t have access to xyz files.');

    const u = await app.c('authentication').user('admin');
    await app.c('authentication').userFieldValue(u, 'view-content-permission-xyz', '1');

    console.log('After updating permission go to the xyz access index.html file');
    await page.goto('http://node:8080/private/restricted-by-permission/permission-xyz/access/index.html');

    // Get the status code
    const status2 = await page.evaluate(() => {
      return document.body.textContent.includes('You are seeing xyz access index html.') ? 403 : 200;
    });

    // Assert status and message
    expect(status).to.equal(200);

    // Check the HTML content
    const content4 = await page.content();
    expect(content4).to.include('You are seeing xyz access index html.');


    console.log('After disabling permission to view xyz files go to the xyz access index.html file');
    await app.c('authentication').userFieldValue(u, 'view-content-permission-xyz', '0');

    await page.goto('http://node:8080/private/restricted-by-permission/permission-xyz/access/index.html');

    // Get the status code
    const status3 = await page.evaluate(() => {
      return document.body.textContent.includes('Sorry, you don\'t have access to xyz files.') ? 403 : 200;
    });

    // Assert status and message
    expect(status).to.equal(403);

    // Check the HTML content
    const content3 = await page.content();
    expect(content3).to.include('Sorry, you don\'t have access to xyz files.');

  }
  catch (error) {
    await testBase.showError(error, browser);
  }
  await browser.close();
});
