// const { expect } = require('chai');
// const fs = require('fs');
// const testBase = require('./testBase.js');

// it('It should be possible to send an email to MailHog', async function() {
//   this.timeout(25000);
//   const puppeteer = require('puppeteer');
//   const browser = await puppeteer.launch({
//      headless: true,
//      args: ['--no-sandbox', '--disable-setuid-sandbox']
//   });
//   var result = false;
//   try {
//     const page = await browser.newPage();
//     console.log('set viewport');
//     await page.setViewport({ width: 1280, height: 800 });
//     console.log('go to the home page');
//     await page.goto('http://mail:8025');
//     await page.waitForSelector('.msglist-message.row');
//     await testBase.assertInSourceCode(page, 'This message was sent by node: ' + process.env.TOKEN, 'mail');
//   }
//   catch (error) {
//     await testBase.showError(error, browser);
//   }
//   await browser.close();
// });
