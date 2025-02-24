const { expect } = require('chai');
const fs = require('fs');
const testBase = require('./testBase.js');

// first login as xyz in browser 1, confirm welcome xyz text and then call
// unmerge xyz2 to ensure xyz and xyz2 are unmerged initially. Then in
// browser 2 login as xyz2 and confirm welcome xyz2 messege.
// xyz2 in another browser. confirm welcome xyz2 text.
// Now merge xyz,xyz2. Then refresh home page in browser 1 to see welcome xyz.
// refresh home page in browser 2 to see welcome xyz (because user account megrd.).
// unmerge zyz2. then refresh home page in browser 1 to see welcome xyz.
// refresh home page in browser 2 to see welcome xyz2 (because user account unmerged.)

it('should merge account and display merged account name in welcome.', async function() {
  this.timeout(50000);
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
    const authApiToken = process.env.AUTH_API_TOKEN;

    console.log("Login as xyz");
    const page1 = await browser1.newPage();
    console.log('set viewport');
    await page1.setViewport({ width: 1280, height: 800 });
    console.log('go to the home page');
    await page1.goto('http://node:8080');
    await testBase.screenshot(page1, 'xyz-login-page1', await page1.content());

    await page1.type('[name=username]', 'xyz');
    await page1.type('[name=password]', process.env.XYZ_PASSWORD);
    await page1.keyboard.press('Enter');
    await page1.waitForSelector('#messages');
    await page1.waitForSelector('#numusers_wrapper');
    await testBase.screenshot(page1, 'xyz-home-page1', await page1.content());
    const welcomeMessagexyz = await page1.$eval('#numusers_wrapper', el => el.textContent);
    expect(welcomeMessagexyz).to.include('Welcome xyz.');

    // Fetch JSON response using page1 to unmerge the xyz if already merged.
    const response = await page1.evaluate(async (authApiToken) => {
      const res = await fetch('http://node:8080/account-framework/unmerge-accounts/' + authApiToken, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          {
            "username": "xyz2"
          }
        )
      });
      const data = await res.json();
      return data;
    }, authApiToken);

    console.log("Login as xyz2 in another browser");
    const page2 = await browser2.newPage();
    console.log('set viewport');
    await page2.setViewport({ width: 1280, height: 800 });
    console.log('go to the home page');
    await page2.goto('http://node:8080');
    await testBase.screenshot(page2, 'xyz2-login-page1', await page2.content());

    await page2.type('[name=username]', 'xyz2');
    await page2.type('[name=password]', process.env.XYZ2_PASSWORD);
    await page2.keyboard.press('Enter');
    await page2.waitForSelector('#messages');
    await page2.waitForSelector('#numusers_wrapper');
    await testBase.screenshot(page2, 'xyz2-home-page1', await page2.content());
    const welcomeMessagexyz2 = await page2.$eval('#numusers_wrapper', el => el.textContent);
    expect(welcomeMessagexyz2).to.include('Welcome xyz2.');

    // Fetch JSON response using page2
    const response2 = await page2.evaluate(async (authApiToken) => {
      const res = await fetch('http://node:8080/account-framework/merge-accounts/' + authApiToken, {
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

      const data = await res.json();
      return data;
    }, authApiToken);

    console.log('go to the xyz home page again');
    await page1.goto('http://node:8080');
    await testBase.screenshot(page1, 'xyz-home-page-again', await page1.content());
    const welcomeMessagexyz3 = await page1.$eval('#numusers_wrapper', el => el.textContent);
    expect(welcomeMessagexyz3).to.include('Welcome xyz.');

    console.log('go to the xyz2 home page again');
    await page2.goto('http://node:8080');
    await testBase.screenshot(page2, 'xyz2-home-page-again2', await page2.content());
    const welcomeMessagexyz4 = await page2.$eval('#numusers_wrapper', el => el.textContent);
    expect(welcomeMessagexyz4).to.include('Welcome xyz.');

    // Fetch JSON response using page1 to unmerge the xyz2 if already merged.
    const response3 = await page1.evaluate(async (authApiToken) => {
      const res = await fetch('http://node:8080/account-framework/unmerge-accounts/' + authApiToken, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          {
            "username": "xyz2"
          }
        )
      });
      const data = await res.json();
      return data;
    }, authApiToken);

    console.log('go to the xyz home page again');
    await page1.goto('http://node:8080');
    await testBase.screenshot(page1, 'xyz-home-page-again3', await page1.content());
    const welcomeMessagexyz5 = await page1.$eval('#numusers_wrapper', el => el.textContent);
    expect(welcomeMessagexyz5).to.include('Welcome xyz.');

    console.log('go to the xyz2 home page again');
    await page2.goto('http://node:8080');
    await testBase.screenshot(page2, 'xyz2-home-page-again4', await page2.content());
    const welcomeMessagexyz6 = await page2.$eval('#numusers_wrapper', el => el.textContent);
    expect(welcomeMessagexyz6).to.include('Welcome xyz2.');

  }
  catch (error) {
    await testBase.showError(error, browser1);
    await testBase.showError(error, browser2);
  }
  await browser1.close();
  await browser2.close();
});


// first login as xyz in browser 1, confirm welcome xyz text and then call
// unmerge xyz2 to ensure xyz and xyz2 are unmerged initially. Then in
// browser 2 login as xyz2 and confirm welcome xyz2 messege.
// xyz2 in another browser. confirm welcome xyz2 text.
// Now send messege from xyz and send messege from xyz2 respectively.
// messege history should show xyz, its messeges. xyz2 its messeges.
// Now merge xyz,xyz2. Then refresh home page in browser 1 to see welcome xyz.
// refresh home page in browser 2 to see welcome xyz (because user account megrd.).
// Now messege history from xyz and messege history from xyz2 both show all
// sender name as xyz because xyz and xyz2 are merged.
// send new messge from xyz2 to should display sender name as xyz.
// unmerge zyz2. then refresh home page in browser 1 to see welcome xyz.
// Now messege history should xyz and its messges and xyz2 and its messges.

it('should merge account and display merged account name in messege history.', async function() {
  this.timeout(50000);
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
    const authApiToken = process.env.AUTH_API_TOKEN;

    console.log("Login as xyz");
    const page1 = await browser1.newPage();
    console.log('set viewport');
    await page1.setViewport({ width: 1280, height: 800 });
    console.log('go to the home page');
    await page1.goto('http://node:8080');
    await testBase.screenshot(page1, 'xyz-login-page1', await page1.content());

    await page1.type('[name=username]', 'xyz');
    await page1.type('[name=password]', process.env.XYZ_PASSWORD);
    await page1.keyboard.press('Enter');
    await page1.waitForSelector('#messages');
    await page1.waitForSelector('#numusers_wrapper');
    await testBase.screenshot(page1, 'xyz-home-page1', await page1.content());
    const welcomeMessagexyz = await page1.$eval('#numusers_wrapper', el => el.textContent);
    expect(welcomeMessagexyz).to.include('Welcome xyz.');


    // Fetch JSON response using page1 to unmerge the xyz if already merged.
    const response = await page1.evaluate(async (authApiToken) => {
      const res = await fetch('http://node:8080/account-framework/unmerge-accounts/' + authApiToken, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          {
            "username": "xyz2"
          }
        )
      });
      const data = await res.json();
      return data;
    }, authApiToken);

    console.log("Login as xyz2 in another browser");
    const page2 = await browser2.newPage();
    console.log('set viewport');
    await page2.setViewport({ width: 1280, height: 800 });
    console.log('go to the home page');
    await page2.goto('http://node:8080');
    await testBase.screenshot(page2, 'xyz2-login-page1', await page2.content());

    await page2.type('[name=username]', 'xyz2');
    await page2.type('[name=password]', process.env.XYZ2_PASSWORD);
    await page2.keyboard.press('Enter');
    await page2.waitForSelector('#messages');
    await page2.waitForSelector('#numusers_wrapper');
    await testBase.screenshot(page2, 'xyz2-home-page1', await page2.content());
    const welcomeMessagexyz2 = await page2.$eval('#numusers_wrapper', el => el.textContent);
    expect(welcomeMessagexyz2).to.include('Welcome xyz2.');

    const randomMessage = 'A random number is ' + String(Math.random());
    const randomMessage2 = 'A random number is ' + String(Math.random());

    await testBase.assertInSourceCode(page1, 'Send Message', 'home');
    await testBase.screenshot(page1, 'home-page1', await page1.content());
    await page1.type('#message', randomMessage);
    await page1.click('#send');
    await testBase.screenshot(page1, 'home-page1-after-messege', await page1.content());

    await testBase.assertInSourceCode(page2, 'Send Message', 'home');
    await testBase.screenshot(page2, 'home-page2', await page2.content());
    await page2.type('#message', randomMessage2);
    await page2.click('#send');
    await testBase.screenshot(page2, 'home-page2-after-messege', await page2.content());

    // Get all <h4> elements within #messages
    const h4Texts1 = await page1.$$eval('#messages .message-single h4', elements =>
      elements.map(el => el.innerText)
    );

    // Check if the second-to-last element is "xyz"
    expect(h4Texts1[h4Texts1.length - 2]).to.equal('xyz');

    const h4Texts2 = await page2.$$eval('#messages .message-single h4', elements =>
      elements.map(el => el.innerText)
    );

    // Check if the last element is "xyz2"
    expect(h4Texts2[h4Texts2.length - 1]).to.equal('xyz2');

    // Fetch JSON response using page2
    const response2 = await page2.evaluate(async (authApiToken) => {
      const res = await fetch('http://node:8080/account-framework/merge-accounts/' + authApiToken, {
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

      const data = await res.json();
      return data;
    }, authApiToken);

    console.log('go to the xyz home page again');
    await page1.goto('http://node:8080');
    await testBase.screenshot(page1, 'xyz-home-page-again', await page1.content());
    const welcomeMessagexyz3 = await page1.$eval('#numusers_wrapper', el => el.textContent);
    expect(welcomeMessagexyz3).to.include('Welcome xyz.');

    console.log('go to the xyz2 home page again');
    await page2.goto('http://node:8080');
    await testBase.screenshot(page2, 'xyz2-home-page-again2', await page2.content());
    const welcomeMessagexyz4 = await page2.$eval('#numusers_wrapper', el => el.textContent);
    expect(welcomeMessagexyz4).to.include('Welcome xyz.');

    await testBase.assertInSourceCode(page1, 'Send Message', 'home');
    await testBase.screenshot(page1, 'home-page1', await page1.content());
    await page1.type('#message', randomMessage);
    await page1.click('#send');
    await testBase.screenshot(page1, 'home-page1-after-messege', await page1.content());

    await testBase.assertInSourceCode(page2, 'Send Message', 'home');
    await testBase.screenshot(page2, 'home-page2', await page2.content());
    await page2.type('#message', randomMessage2);
    await page2.click('#send');
    await testBase.screenshot(page2, 'home-page2-after-messege', await page2.content());

    // Get all <h4> elements within #messages
    const h4Texts3 = await page1.$$eval('#messages .message-single h4', elements =>
      elements.map(el => el.innerText)
    );
    // Check if the second-to-last element is "xyz"
    expect(h4Texts3[h4Texts3.length - 2]).to.equal('xyz');

    const h4Texts4 = await page2.$$eval('#messages .message-single h4', elements =>
      elements.map(el => el.innerText)
    );
    // Check if the last element is "xyz"
    expect(h4Texts4[h4Texts4.length - 1]).to.equal('xyz');

    // Fetch JSON response using page1 to unmerge the xyz2 if already merged.
    const response3 = await page1.evaluate(async (authApiToken) => {
      const res = await fetch('http://node:8080/account-framework/unmerge-accounts/' + authApiToken, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          {
            "username": "xyz2"
          }
        )
      });
      const data = await res.json();
      return data;
    }, authApiToken);

    console.log('go to the xyz home page again');
    await page1.goto('http://node:8080');
    await testBase.screenshot(page1, 'xyz-home-page-again3', await page1.content());
    const welcomeMessagexyz5 = await page1.$eval('#numusers_wrapper', el => el.textContent);
    expect(welcomeMessagexyz5).to.include('Welcome xyz.');

    console.log('go to the xyz2 home page again');
    await page2.goto('http://node:8080');
    await testBase.screenshot(page2, 'xyz2-home-page-again4', await page2.content());
    const welcomeMessagexyz6 = await page2.$eval('#numusers_wrapper', el => el.textContent);
    expect(welcomeMessagexyz6).to.include('Welcome xyz2.');

    // Get all <h4> elements within #messages
    const h4Texts5 = await page1.$$eval('#messages .message-single h4', elements =>
      elements.map(el => el.innerText)
    );
    // Check if the second-to-last element is "xyz"
    expect(h4Texts5[h4Texts5.length - 2]).to.equal('xyz');

    const h4Texts6 = await page2.$$eval('#messages .message-single h4', elements =>
      elements.map(el => el.innerText)
    );
    // Check if the last element is "xyz2"
    expect(h4Texts5[h4Texts5.length - 1]).to.equal('xyz2');

  }
  catch (error) {
    await testBase.showError(error, browser1);
    await testBase.showError(error, browser2);
  }
  await browser1.close();
  await browser2.close();
});
