const { expect } = require('chai');
const fs = require('fs').promises;
const testBase = require('./testBase.js');

it("You shouldn't send message if SENDM_API_TOKEN is not sent in url", async function() {
  console.log('Testing ' + __filename);
  try {
    const response = await fetch('http://node:8080/sms/send/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {"sendTo":"91XXXXXXXXX"}
      )
    });
    expect(response.status).to.equal(404);
  }
  catch (error) {
    console.log(error);
  }
});

it("You shouldn't send message if SENDM_API_TOKEN in url is invalid", async function() {
  console.log('Testing ' + __filename);
  try {
    const response = await fetch('http://node:8080/sms/send/dafasdfasdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {"sendTo":"91XXXXXXXXX"}
      )
    });
    expect(response.status).to.equal(403);
  }
  catch (error) {
    console.log(error);
  }
});

it("send sms should send to a respective sendTo number or written to file.", async function() {
  console.log('Testing ' + __filename);
  try {
    const envMode = process.env.DEV_MODE;
    const sendmApiToken = process.env.SENDM_API_TOKEN;
    const response = await fetch('http://node:8080/sms/send/'+sendmApiToken, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {"message": "This is a test", "sendTo":"+91XXXXXXXXX"}
      )
    });

    // developement environment.
    if (envMode === "true") {
      // Get content of a file.
      const content = await testBase.getcontentOfAFile(
        '/unversioned/output/sms-sent.json',
      );
      // Log confirmation message
      console.log("Confirm that Reply Message saved to file if it is dev environment");
      // Assert that the file contains the expected message
      expect(content).to.include('This is a test');
      console.log("Confirm that Message sent successfully");
      expect(response.status).to.equal(200);
    }
  }
  catch (error) {
    console.log(error);
  }
});

it("verify Message couldn't be send case.", async function() {
  console.log('Testing ' + __filename);
  try {
    const sendmApiToken = process.env.SENDM_API_TOKEN;
    const response = await fetch('http://node:8080/whatsappmessage/send/'+sendmApiToken, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {"sendTo":"91XXXXXXXXX"}
      )
    });

    console.log("Confirm that Message couldn't be send. Kindly check Error Logs. case");
    expect(response.status).to.equal(500);
  }
  catch (error) {
    console.log(error);
  }
});
