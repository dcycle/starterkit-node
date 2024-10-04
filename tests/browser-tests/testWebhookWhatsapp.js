// const { expect } = require('chai');
// const testBase = require('./testBase.js');

// it("If account ssid different then message should get saved to a file but shouldn't get stored in database", async function() {
//   console.log('Testing ' + __filename);
//   try {
//     console.log("send message to /webhook/whatsapp");
//     const response = await fetch('http://node:8080/webhook/whatsapp', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         AccountSid: 'testUser',
//         SmsMessageSid: 'SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
//         NumMedia: '0',
//         ProfileName: 'Profile Name',
//         MessageType: 'text',
//         SmsSid: 'SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
//         WaId: '1234567890',
//         SmsStatus: 'delivered',
//         Body: 'Test message',
//         To: '+1234567890',
//         NumSegments: '1',
//         ReferralNumMedia: '0',
//         MessageSid: 'SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
//         From: '+0987654321',
//         ApiVersion: '2010-04-01'
//       })
//     });


//     // Get content of a file.
//     const content = testBase.getcontentOfAFile(
//       '/unversioned/output/whatsapp.json',
//     );

//     // Log confirmation message
//     console.log("Confirm that Message saved to file");
//     expect(content).to.include('Test message');

//     console.log("Ensuring that account ssid id is different then we should get 403");
//     // Assert status and message
//     expect(response.status).to.equal(403);
//   }
//   catch (error) {
//     console.log(error);
//   }
// });


// it("If account ssid same as message then message should get saved to a file and also should get stored in database", async function() {
//   const twilioUser = process.env.TWILIO_USER;
//   const whatsappDev = process.env.WHATSAPP_DEV_MODE;

//   console.log('Testing ' + __filename);
//   try {
//     console.log("send message to /webhook/whatsapp");
//     const response = await fetch('http://node:8080/webhook/whatsapp', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         AccountSid: twilioUser,
//         SmsMessageSid: 'SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
//         NumMedia: '0',
//         ProfileName: 'Profile Name',
//         MessageType: 'text',
//         SmsSid: 'SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
//         WaId: '1234567890',
//         SmsStatus: 'delivered',
//         Body: 'Test message2',
//         To: '+1234567890',
//         NumSegments: '1',
//         ReferralNumMedia: '0',
//         MessageSid: 'SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
//         From: '+0987654321',
//         ApiVersion: '2010-04-01'
//       })
//     });

//     // Get content of a file.
//     const content = testBase.getcontentOfAFile(
//       '/unversioned/output/whatsapp.json',
//     );

//     // // Log confirmation message
//     console.log("Confirm that Message saved to file");
//     expect(content).to.include('Test message2');

//     console.log("Ensuring that account ssid id is same then we should get 200");
//     // Assert status and message
//     expect(response.status).to.equal(200);
//   }
//   catch (error) {
//     console.log(error);
//   }
// });

// it("If account ssid undefined then message shouldn't stored in db", async function() {
//   const twilioUser = process.env.TWILIO_USER;

//   console.log('Testing ' + __filename);
//   try {
//     console.log("send message to /webhook/whatsapp");
//     const response = await fetch('http://node:8080/webhook/whatsapp', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         SmsMessageSid: 'SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
//         NumMedia: '0',
//         ProfileName: 'Profile Name',
//         MessageType: 'text',
//         SmsSid: 'SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
//         WaId: '1234567890',
//         SmsStatus: 'delivered',
//         Body: 'Test message2',
//         To: '+1234567890',
//         NumSegments: '1',
//         ReferralNumMedia: '0',
//         MessageSid: 'SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
//         From: '+0987654321',
//         ApiVersion: '2010-04-01'
//       })
//     });

//     console.log("Ensuring account ssid is undefined then we should get 403");
//     // Assert status and message
//     expect(response.status).to.equal(403);
//   }
//   catch (error) {
//     console.log(error);
//   }
// });