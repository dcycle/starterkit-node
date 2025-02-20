const { expect } = require('chai');
const fs = require('fs');
const testBase = require('./testBase.js');

// first login as xyz in one browser and xyz2 in another browser. confirm welcome text
// shows respective logged in user names.
// then merge the xyz and xyz2. In browser1 call home page it should show welcome xyz.
// In browser2 call home page it should show welcome xyz. because we have merged the accounts.
it('should merge account and display merged account name in welcome.', async function() {
  this.timeout(25000);
  const puppeteer = require('puppeteer');
  const browser1 = await puppeteer.launch({
    //  headless: true,
     args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const browser2 = await puppeteer.launch({
    // headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
 });
  
  try {
    console.log('Testing ' + __filename);
    console.log("Login as xyz");
    const page1 = await browser1.newPage();
    console.log('set viewport');
    await page1.setViewport({ width: 1280, height: 800 });
    console.log('go to the home page');
    await page1.goto('http://node:8080');
    await testBase.screenshot(page1, 'xyz-login-page', await page1.content());

    await page1.type('[name=username]', 'xyz');
    await page1.type('[name=password]', process.env.XYZ_PASSWORD);
    await page1.keyboard.press('Enter');
    await page1.waitForSelector('#messages');
    await page1.waitForSelector('#numusers_wrapper');
    await testBase.screenshot(page1, 'xyz-home-page', await page1.content());
    const welcomeMessagexyz = await page1.$eval('#numusers_wrapper', el => el.textContent);
    expect(welcomeMessagexyz).to.include('Welcome xyz.');

    console.log("Login as xyz2 in another browser");
    const page2 = await browser2.newPage();
    console.log('set viewport');
    await page2.setViewport({ width: 1280, height: 800 });
    console.log('go to the home page');
    await page2.goto('http://node:8080');
    await testBase.screenshot(page2, 'xyz2-login-page', await page2.content());

    await page2.type('[name=username]', 'xyz2');
    await page2.type('[name=password]', process.env.XYZ2_PASSWORD);
    await page2.keyboard.press('Enter');
    await page2.waitForSelector('#messages');
    await page2.waitForSelector('#numusers_wrapper');
    await testBase.screenshot(page2, 'xyz2-home-page', await page2.content());
    const welcomeMessagexyz2 = await page2.$eval('#numusers_wrapper', el => el.textContent);
    expect(welcomeMessagexyz2).to.include('Welcome xyz2.');

    const response = await fetch('http://node:8080/account-framework/merge-accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {
          "username1": "xyz",
          "username2": "xyz2"
        }
      )
    });
    expect(response.status).to.equal(200);
    console.log("----response---------");
    console.log(response.data);

    console.log('go to the xyz home page again');
    await page1.goto('http://node:8080');
    await testBase.screenshot(page1, 'xyz-home-page-again', await page1.content());
    const welcomeMessagexyz3 = await page1.$eval('#numusers_wrapper', el => el.textContent);
    expect(welcomeMessagexyz3).to.include('Welcome xyz.');

    console.log('go to the xyz2 home page again');
    await page2.goto('http://node:8080');
    await testBase.screenshot(page2, 'xyz2-home-page-again', await page2.content());
    const welcomeMessagexyz4 = await page2.$eval('#numusers_wrapper', el => el.textContent);
    expect(welcomeMessagexyz4).to.include('Welcome xyz.');

  }
  catch (error) {
    await testBase.showError(error, browser1);
    await testBase.showError(error, browser2);
  }
  await browser1.close();
  await browser2.close();
});
