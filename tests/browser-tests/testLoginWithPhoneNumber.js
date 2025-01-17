const { expect } = require('chai');
const fs = require('fs').promises;
const testBase = require('./testBase.js');

it("should call the login endpoint and get a valid response for whatsapp", async function() {
  console.log('Testing ' + __filename);
  try {
    const response = await fetch('http://node:8080/auth/phone-number', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(
        { 	
          phoneNumber: "+91000000000",
          textframeworkSelected: "whatsapp"
        }
      )
    });

    expect(response.status).to.equal(200);
    // Assuming response contains JSON data, parse it
    const data = await response.json();

    // Check the response body for expected properties and values
    expect(data).to.have.property('success').that.equals(true);
    expect(data).to.have.property('message');

    expect(data.message).to.equal('Kindly Enter the Login Token Sent through whatsapp.');    
  }
  catch (error) {
    console.log(error);
  }
});

it("should call the login endpoint and get a valid response for sms", async function() {
  console.log('Testing ' + __filename);
  try {
    const response = await fetch('http://node:8080/auth/phone-number', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(
        { 	
          phoneNumber: "+91000000000",
          textframeworkSelected: "sms"
        }
      )
    });

    expect(response.status).to.equal(200);
    // Assuming response contains JSON data, parse it
    const data = await response.json();

    // Check the response body for expected properties and values
    expect(data).to.have.property('success').that.equals(true);
    expect(data).to.have.property('message');
    
    expect(data.message).to.equal('Kindly Enter the Login Token Sent through sms.');
  }
  catch (error) {
    console.log(error);
  }
});

it("should call the login endpoint and get a valid response for whatsapp", async function() {
  console.log('Testing ' + __filename);
  try {
    const response = await fetch('http://node:8080/auth/phone-number', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(
        { 	
          phoneNumber: "+91000000000",
          textframeworkSelected: "internal"
        }
      )
    });

    expect(response.status).to.equal(200);
    // Assuming response contains JSON data, parse it
    const data = await response.json();

    // Check the response body for expected properties and values
    expect(data).to.have.property('success').that.equals(true);
    expect(data).to.have.property('message');

    expect(data.message).to.equal('Kindly Enter the Login Token Sent through internal.');
  }
  catch (error) {
    console.log(error);
  }
});

function assertElementVisible(element, selector) {
  if (element === null) {
    throw new Error(`Element with selector "${selector}" is not visible on the page`);
  }
}

it('should fill in the form and generate a token for sms and submit form', async function () {
  this.timeout(40000);
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({
     headless: true,
     args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  try {
    const envMode = process.env.DEV_MODE;
    console.log('Testing ' + __filename);
    const page = await browser.newPage();
    console.log('set viewport');
    await page.setViewport({ width: 1280, height: 800 });
    console.log('go to the home page');
    await page.goto('http://node:8080/login-with-phone-number');
    await page.waitForSelector('#phoneNumber');
    await testBase.assertInSourceCode(page, 'Login With Phone Number', 'Login With Phone Number');

    const phoneNumber = '+10900000000';
    // Assuming 'sms' is one of the available text frameworks
    const textFramework = 'sms';

    // Fill in the phone number
    await page.type('#phoneNumber', phoneNumber);

    // Select the text framework (radio button)
    await page.click(`input[name="textframeworkSelected"][value="${textFramework}"]`);

    // Click the "Generate Token" button
    await page.click('#generateTokenBtn');

    // Wait for the token field to appear (token field should appear after generating the token)
    await page.waitForSelector('#tokenInput', { visible: true });

    // Check if the error message is shown (or any other relevant confirmation)
    const errorMessage = await page.$eval('#error-message', (el) => el.innerText);
    expect(errorMessage).to.include('Kindly Enter the Login Token Sent through sms.');

    // Verify if the token input field is visible
    const tokenFieldVisible = await page.$('#tokenInput');
    assertElementVisible(tokenFieldVisible, '#tokenInput');

    // developement environment.
    if (envMode === "true") {
      // Get content of a file.
      const content = await testBase.getcontentOfAFile(
        '/unversioned/output/sms-sent.json',
      );

      // Step 1: Split the string into individual JSON objects (assuming each object is valid JSON)
      let jsonObjects = content.match(/\{[^}]+\}/g);

      // Step 2: Extract the token from the first object
      if (jsonObjects && jsonObjects.length > 0) {
        // Parse the first JSON object
        const firstObject = JSON.parse(jsonObjects[0]);
        // Extract the message
        const message = firstObject.message;
        // Get the token part after 'token is :'
        const token = message.split(":")[1].trim();
        // Output will be the first token: rKyfdx
        // console.log(token);
        // Fill in the token
        await page.type('#tokenInput', token);
        // Click the "Generate Token" button
        await page.click('#submitBtn');

        // Adjust based on your needs
        // await page.waitForSelector('#message');

        // Check the HTML content
        const content = await page.content();
        expect(content).to.include("Send Message");
      } else {
        console.log("No valid JSON objects found.");
      }
    }
  }
  catch (error) {
    await testBase.showError(error, browser);
  }
  await browser.close();  
});

it('should fill in the form and generate a token for whatsapp and submit form', async function () {
  this.timeout(40000);
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({
     headless: true,
     args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  try {
    const envMode = process.env.DEV_MODE;
    console.log('Testing ' + __filename);
    const page = await browser.newPage();
    console.log('set viewport');
    await page.setViewport({ width: 1280, height: 800 });
    console.log('go to the home page');
    await page.goto('http://node:8080/login-with-phone-number');
    await page.waitForSelector('#phoneNumber');
    await testBase.assertInSourceCode(page, 'Login With Phone Number', 'Login With Phone Number');

    const phoneNumber = '+10900000000';
    // Assuming 'sms' is one of the available text frameworks
    const textFramework = 'whatsapp';

    // Fill in the phone number
    await page.type('#phoneNumber', phoneNumber);

    // Select the text framework (radio button)
    await page.click(`input[name="textframeworkSelected"][value="${textFramework}"]`);

    // Click the "Generate Token" button
    await page.click('#generateTokenBtn');

    // Wait for the token field to appear (token field should appear after generating the token)
    await page.waitForSelector('#tokenInput', { visible: true });

    // developement environment.
    if (envMode === "true") {
      // Get content of a file.
      const content = await testBase.getcontentOfAFile(
        '/unversioned/output/whatsapp-send.json',
      );

      // Step 1: Split the string into individual JSON objects (assuming each object is valid JSON)
      let jsonObjects = content.match(/\{[^}]+\}/g);

      // Step 2: Extract the token from the first object
      if (jsonObjects && jsonObjects.length > 0) {
        // Parse the first JSON object
        const firstObject = JSON.parse(jsonObjects[0]);
        // Extract the message
        const message = firstObject.message;
        // Get the token part after 'token is :'
        const token = message.split(":")[1].trim();
        // Output will be the first token: rKyfdx
        // Fill in the token
        await page.type('#tokenInput', token);
        // Click the "Generate Token" button
        await page.click('#submitBtn');
        await testBase.screenshot(page, 'login-with-phone-whatsapp-submit', await page.content());
        await page.waitForSelector('#message');

        // Check the HTML content
        const content = await page.content();
        expect(content).to.include("Send Message");
      } else {
        console.log("No valid JSON objects found.");
      }
    }
  }
  catch (error) {
    await testBase.showError(error, browser);
  }
  await browser.close();  
});
