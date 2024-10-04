// const { expect } = require('chai');
// const fs = require('fs');
// const puppeteer = require('puppeteer');

// var screenshot = exports.screenshot = async function(page, name, content) {
//   console.log('SCREENSHOT: ./do-not-commit/screenshots/' + name + '.png');
//   console.log('SCREENSHOT: ./do-not-commit/dom-captures/' + name + '.html');
//   await page.screenshot({path: '/artifacts/screenshots/' + name + '.png'});
//   fs.writeFile('/artifacts/dom-captures/' + name + '.html', content, function(err) {
//     if (err) {
//       return console.log(err);
//     }
//     else {
//       console.log('File ' + name + ' has been saved.');
//       result = true;
//     }
//     // https://github.com/jshint/jshint/issues/3070
//     /* jshint ignore:start */
//     expect(result).to.be.true;
//     /* jshint ignore:end */
//   });
// };

// exports.sleep = async function(ms) {
//   return new Promise((resolve) => {
//     setTimeout(resolve, ms);
//   });
// };

// exports.assertInSourceCode = async function(page, text, filename="") {
//   if (filename == "") {
//     filename = Math.random();
//   }
//   console.log(' Making sure current URL has the text ');
//   console.log('====> ' + text);
//   console.log(' Saving to ' + filename);
//   await screenshot(page, filename, content = await page.content());
//   try {
//     expect(content).to.include(text);
//   }
//   catch (error) {
//     throw "ERROR - the source code in ./do-not-commit/dom-captures/" + filename + ".html does not contain the string " + text;
//   }
// };

// exports.showError = async function (error, browser) {
//   // See https://www.asciiart.eu/computers/computers
//   console.log('Exception alert');
//   console.log('         _______');
//   console.log('        |.-----.|');
//   console.log('        ||x . x||');
//   console.log('        ||_.-._||');
//   console.log('        `--)-(--`');
//   console.log('       __[=== o]___');
//   console.log('      |:::::::::::|');
//   console.log('      `-=========-`()');
//   await browser.close();
//   console.log(error);
// };

// exports.getcontentOfAFile = (filePath) => {
//   try {
//     // Read the file's content synchronously
//     const fileContent = fs.readFileSync(filePath, 'utf8');
//     return fileContent;
//   } catch (error) {
//     // Handle errors
//     console.error('Error reading file:', error);
//     return false;
//   }
// };