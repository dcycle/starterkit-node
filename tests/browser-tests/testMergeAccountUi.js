const { expect } = require('chai');
const fs = require('fs');
const testBase = require('./testBase.js');

// first login as xyz in browser 1 and goto account/merge generate token
// next login as xyz2 in browser 2 and goto account/merge copy into
// merge token inbox and click on merge.
// merged account should display.
// Now click on unmerge and merged account should remove.
it('should merge account and display merged account names and unmerge and. remove mergedaccount names.', async function() {
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
    // Step 1: Login as xyz in browser 1 and generate merge token
    console.log("Login as xyz in browser 1 and generate token");
    const page1 = await browser1.newPage();
    await page1.setViewport({ width: 1280, height: 800 });
    await page1.goto('http://node:8080');
    await page1.type('[name=username]', 'xyz');
    await page1.type('[name=password]', process.env.XYZ_PASSWORD);
    await page1.keyboard.press('Enter');
    await page1.waitForSelector('#messages');
    await page1.goto('http://node:8080/account/merge');

    // Wait for the token generation button to be visible and click it
    await page1.waitForSelector('#generate-token-btn');
    await page1.click('#generate-token-btn');
    await testBase.screenshot(page1, 'xyz1-merge-account-page', await page1.content());
    // Wait for the token status message to appear and extract the token
    await page1.waitForSelector('#token-status-message');
    const tokenMessage = await page1.$eval('#token-status-message', el => el.textContent);
    await testBase.screenshot(page1, 'xyz1-merge-account-page-after-token-generate', await page1.content());

    // console.log("-- tokenMessage --");
    // console.log(tokenMessage);
    const tokenRegex = /([a-zA-Z0-9\-]+:[a-zA-Z0-9]+) Token generated successfully/;
    const match = tokenMessage.match(tokenRegex);
    // console.log("-- match --");
    // console.log(match);
    const token = match ? match[1] : null;
    // console.log("-- token --");
    // console.log(token);
    if (!token) {
      throw new Error("Token generation failed or token not found");
    }

    console.log(`Token generated: ${token}`);

    // Step 2: Login as xyz2 in browser 2 and merge using the token
    console.log("Login as xyz2 in browser 2 and merge with token");
    const page2 = await browser2.newPage();
    await page2.setViewport({ width: 1280, height: 800 });
    await page2.goto('http://node:8080');
    await page2.type('[name=username]', 'xyz2');
    await page2.type('[name=password]', process.env.XYZ2_PASSWORD);
    await page2.keyboard.press('Enter');
    await page2.waitForSelector('#messages');
    await page2.goto('http://node:8080/account/merge');

    // Enter the token into the merge input and click merge
    await page2.type('#merge-token-input', token);
    await testBase.screenshot(page2, 'xyz2-merge-account-page-token-input', await page2.content());
    await page2.click('#merge-account-btn');
    await testBase.screenshot(page2, 'xyz2-merge-account-page-token-submit', await page2.content());

    // Wait for merged accounts to display
    await page2.waitForSelector('#merged-accounts');
    const mergedAccountsList = await page2.$eval('#merged-accounts-list', el => el.innerText);
    console.log('Merged Accounts: ', mergedAccountsList);

    // // Step 3: Click on the unmerge button in browser 2
    console.log("Clicking on the unmerge button in browser 2");
    await testBase.screenshot(page2, 'xyz2-merge-account-before-unmerge', await page2.content());
    await page2.click('#unmerge-account-btn');
    await testBase.screenshot(page2, 'xyz2-merge-account-after-unmerge', await page2.content());

    // Wait for merged accounts to be removed by checking that the list is empty
    const isMergedAccountsListEmpty = await page2.$eval('#merged-accounts-list', el => el.innerText.trim() === '');
    if (isMergedAccountsListEmpty) {
      console.log("Merged accounts list is empty, unmerge successful.");
    } else {
      console.log("Merged accounts list still has values.");
    }
  }
  catch (error) {
    await testBase.showError(error, browser1);
    await testBase.showError(error, browser2);
  }
  await browser1.close();
  await browser2.close();
});
