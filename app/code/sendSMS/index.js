// @ts-check
// The TypeScript engine will check all JavaScript in this file.

/**
 * In order to send sms ensure valid TWILIO_USER, TWILIO_PASS, FROM_NUM
 * DEV_MODE values present in .env file.
 *
 * If DEV_MODE=true then the sms is saved to file ./unversioned/output/sms-send.json
 * If DEV_MODE=false then the sms is send to respective sendTo number.
 *
 * Ensure DEV_MODE=true in dev mode.
 *
 * Test sms sending functionality in terminal.
 *
 * access nodejs client ./scripts/node-cli.sh
 * Run below code by replacing country code and phone number.
 * >> await app.c('sendSMS').parsepropertySendSMS('{"message": "", "sendTo":"<country code><phone number>"}');
 *
 * example:-
 * >> await app.c('sendSMS').parsepropertySendSMS('{"message": "This is a test message", "sendTo":"+150XXXXXXX"}');
 *
 * Test sms sending functionality using curl.
 *
 * In dev environment:-
 * If you are a authorised user then access .env and copy SENDM_API_TOKEN value and replace in below command.
 * >> curl -X POST --data '{"message": "This is a test", "sendTo":"91XXXXXXXXX"}' http://0.0.0.0:8792/sms/send/<SENDM_API_TOKEN>
 *
 * In test environment:-
 * >> curl -X POST --data '{"message": "This is a test", "sendTo":"91XXXXXXXXXX"}' https://<DOMAIN-NAME>/sms/send/<SENDM_API_TOKEN>
 *
 */

/**
 * Sending sms functionality.
 *
 * ** note **
 * sms are sent only in https enviroment.
 * Authentication failure Errors are logged in http environment.
 */
class SendSMS extends require('../component/index.js') {

  /**
   * Returns the dependencies.
   * @returns {String[]}
   */
  dependencies() {
    return [
      // Dependency on express module.
      './express/index.js',
      // Depends on environment variable module.
      './env/index.js'
    ];
  }

  // Initialization method to set up middleware and routes
  async run(app) {
    app.c('express').addRoute(
      // Name of a Route.
      'sendSMS',
      // HTTP method for this route.
      'post',
      // Route pattern.
      // http://0.0.0.0:8792/sms/send
      '/sms/send/:token',
      async (req, res) => {
        await this.handleRequest(req, res);
      }
    );

    app.c('express').addRoute(
      // Name of a Route.
      'webhookSMS',
      // HTTP method for this route.
      'post',
      // Route pattern.
      // http://0.0.0.0:8792/webhook/twilio-sms
      '/webhook/twilio-sms',
      async (req, res) => {
        console.log("************* req sms *************");
        console.log(req);
        console.log("************* res sms *************");
        console.log(res);
        // await this.handleIncomingSMS(req, res);
      }
    );

    // Return the instance of the class.
    return this;
  }

  /**
   * Handles incoming requests to send a sms.
   *
   * validate token so that authorised person only can access this function.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Promise<void>}
   */
  async handleRequest(req, res) {
    try {
      // Capture the rest of the URL after /send/.
      const token = req.params.token;
      const isValidToken = this.validateToken(token);
      if (!isValidToken) {
        return res.status(403).send('Invalid token.');
      }

      let messageObject = this.parseMessageObject(req.body);

      if (!this.validateMessageObject(messageObject)) {
        return res.status(500).send('Missing required parameters: sendTo and/or message');
      }

      const result = await this.sendSMS(messageObject);
      if (result) {
        res.status(200).send("Message sent successfully!");
      } else {
        res.status(500).send("Message couldn't be sent. Kindly check Error Logs.");
      }
    } catch (error) {
      console.error('Something bad happened:', error.toString());
      res.status(500).send('An error occurred.');
    }
  }

  /**
   * Validates the token against the expected token from the environment.
   * @param {string} token - The token from the request.
   * @returns {boolean} True if the token is valid, otherwise false.
   */
  validateToken(token) {
    const expectedToken = String(require('../env/index.js').required('SENDM_API_TOKEN'));
    return token === expectedToken;
  }

  /**
   * Parses and normalizes the message object from the request body.
   * @param {Object|string} body - The request body, which can be an object or a string.
   * @returns {Object} The normalized message object.
   * @throws {Error} Throws an error if the body is not a valid object.
   */
  parseMessageObject(body) {
    if (typeof body === 'string') {
      return { [body]: '' };
    }
    if (typeof body !== 'object' || body === null) {
      throw new Error('Message object is not valid');
    }
    return body;
  }

  /**
   * Parseproperty of a json and then send message.
   *
   * Executing send message from node-cli.sh
   *
   * example :
   * >> await app.c('sendSMS').sendSMS('{"message": "", "sendTo":"<country code><phone number>"}');
   *
   * parameter are not in json. we need to convert it to json.
   */
  async parsepropertySendSMS(messageObject) {

    if (typeof messageObject === 'string') {
      // Create the new object with the JSON string as the key and an empty string as the value.
      messageObject = { [messageObject]: '' };
    }

    // Ensure messageObject is an object and not null.
    if (typeof messageObject !== 'object' || messageObject === null) {
      throw new Error('Message object is not valid');
    }

    // Extract the key from the object.
    const jsonString = Object.keys(messageObject)[0];

    // Parse the key to an object.
    const parsedObject = JSON.parse(jsonString);

    // Validate the parsed object
    if (!this.validateMessageObject(parsedObject)) {
      return "May be Missing required parameters: sendTo and/or message";
    }
    else {
      return await this.sendSMS(parsedObject);
    }
  }

  /**
   * Using Send Message We are sending messages.
   *
   * @param messageObject
   *   Object should have message and sendTo number to send message to respective number.
   *   '{"message": "This is a test", "sendTo":"+91000000000"}'
   *
   * @return
   *   returns true if message sent successfully else false.
   */
   async sendSMS(messageObject) {
    try {
      /**
       * DEV_MODE=false then message sending functionality executed.
       * else messages are written to ./unversioned/output/sms-send.json file.
       *
       * Ensure DEV_MODE=true in dev mode.
       */
      const isDevMode = this.app().c('env').required('DEV_MODE') === "false";

      if (isDevMode) {
        return await this.sendMessage(messageObject);
      } else {
        return this.writeMessageToFile(messageObject).then((data) => {
          if (data) {
            return true;
          }
          else {
            return false;
          }
        })
        .catch((error) => {
          console.error('Something bad happened:', error.toString());
          return false;
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      return false;
    }
  }

  /**
   * Sends a SMS using the Twilio API.
   * @param {Object} messageObject - The message object containing the message details.
   */
  async sendMessage(messageObject) {
    try {
      // Load Twilio helper library to send SMS
      // @ts-expect-error
      const twilio = require("twilio");

      // Load Twilio credentials and SMS sending number
      const twilioUser = this.app().c('env').required('TWILIO_USER');
      const authToken = this.app().c('env').required('TWILIO_PASS');
      const smsFrom = this.app().c('env').required('FROM_NUM');

      // Authenticate with Twilio
      const client = twilio(twilioUser, authToken);

      let clientMessage = {
        body: messageObject.message,
        from: smsFrom,
        to: messageObject.sendTo
      };

      // Send the message
      const message = await client.messages.create(clientMessage);
      if (message.sid) {
        console.log('SMS sent successfully');
        return true;
      }
      else {
        console.log("SMS hasn't sent");
        return false;
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }

  /**
   * Writes the message object to a file.
   * @param {Object} messageObject - The message object to write to a file.
   */
  async writeMessageToFile(messageObject) {
    try {
      // @ts-expect-error
      const fs = require('fs');
      const jsonMessage = JSON.stringify(messageObject);

      await fs.writeFile('/output/sms-send.json', jsonMessage, (err) => {
        if (err) {
          console.log("SMS send message Coudn't be Written to file. " + err);
          return false;
        }
        console.log("SMS send message written to file successfully");
        return true;
      });
      return true;
    } catch (error) {
      console.error('Error writing to file:', error);
      return false;
    }
  }

  /**
   * Validates the parsed message object.
   * @param {Object} parsedObject - The parsed message object to validate.
   * @throws {Error} If the required parameters are missing.
   */
   validateMessageObject(parsedObject) {
    // Ensure parsedObject is an object
    if (typeof parsedObject !== 'object' || parsedObject === null) {
      return false;
    }

    // Check if 'message' and 'sendTo' are both present and sendTo non-empty string
    const hasValidMessage = typeof parsedObject.message === 'string';
    const hasValidSendTo = typeof parsedObject.sendTo === 'string' && parsedObject.sendTo.trim() !== '';

    // Return true only if both 'message' and 'sendTo' are valid
    return hasValidMessage && hasValidSendTo;
  }

  /**
   * Handles incoming webhook messages, processes them, and saves them
   * to the database if valid.
   *
   * This method is typically used as a webhook handler for incoming messages
   *  from services such as Twilio or WhatsApp.
   *
   * It performs the following actions:
   *
   * 1. Converts the incoming message to a JSON string.
   * 2. Writes the message to a file for logging or future reference.
   * 3. Validates the authenticity of the message based on the `AccountSid`.
   * 4. If valid, retrieves observers for the given message and triggers the
   * `handleObservers` method.
   * 5. Responds to the sender with a success or error XML response.
   *
   * The method ensures that only authenticated messages
   *  (with a valid `AccountSid`) are processed and saved to the database.
   *  It also handles various errors gracefully, returning appropriate HTTP status
   *  codes and error messages when necessary.
   *
   * @param {Object} req - The incoming request object containing the message
   *   data in the body.
   * @param {Object} res - The response object used to send an HTTP response
   *   back to the sender.
   * @returns Promise<void>
   *
   * @throws {Error} Throws an error if the message cannot be processed or
   * saved, triggering a 500 response.
   */
  //  async handleIncomingSMS(req, res) {
  //   try {
  //     const jsonMessage = JSON.stringify(req.body);

  //     // Write the incoming message to file.
  //     await this.writeToFile(jsonMessage);

  //     const messageObject = req.body;
  //     // if account sid is eqaul to twillio user then only store in db.
  //     if (this.validateAuthenticatedMessage(messageObject)) {
  //       let toNumber = req.body.WaId;
  //       // prepend + to phone number.
  //       toNumber = '+' + toNumber;
  //       // Fetch and Run observers related to webhookWhatsApp.
  //       await this.app().c('observers').runObservers(
  //         {
  //           "module": "webhookWhatsApp",
  //           "verb": "receiveMessage",
  //           $or: [
  //             // Match all observers if applyTo is "*"
  //             { applyTo: '*' },
  //             // prepend + to phonenumber country code.
  //             { applyTo: { $in: toNumber.split(',') } }
  //           ]
  //         },
  //         // paramter to pass in to callback function.
  //         {
  //           "messageObject": messageObject,
  //           "number": "+" + toNumber,
  //           "message": "!! WELL RECIEVED !!"
  //         }
  //       );
  //       // Respond with the original message
  //       const resp = this.generateXmlResponse(jsonMessage);
  //       res.status(200).send(resp);
  //     } else {
  //       console.log("Message is not from allowed ssid " + messageObject.AccountSid);
  //       const resp = this.generateErrorXmlResponse("Message is not from allowed to save from this account ssid " + messageObject.AccountSid);
  //       res.status(403).send(resp);
  //     }
  //   } catch (error) {
  //     console.error('Error processing message:', error);
  //     const errorResp = this.generateErrorXmlResponse("Internal Server Error");
  //     res.status(500).send(errorResp);
  //   }
  // }

  // /**
  //  * Writes a given message to a file, prepending it to the beginning of the file content.
  //  *
  //  * This method reads the current contents of the file, prepends the new `jsonMessage`
  //  * to the beginning,
  //  * and then writes the updated content back to the file. If the file does not exist,
  //  * it will be created.
  //  *
  //  * @param {string} jsonMessage - The message to be written to the file.
  //  * @returns {Promise<void>} A promise that resolves when the file has been updated
  //  * successfully or rejects if there is an error.
  //  */
  // async writeToFile(jsonMessage) {
  //   return /** @type {Promise<void>} */(new Promise((resolve, reject) => {
  //     // @ts-expect-error
  //     const fs = require('fs');
  //     const filePath = '/output/whatsapp.json';

  //     // Read the current contents of the file
  //     fs.readFile(filePath, 'utf8', (readErr, data) => {
  //       if (readErr && readErr.code !== 'ENOENT') {
  //         // If the file exists and there's an error reading it, reject with an error
  //         console.error('Error reading from file:', readErr);
  //         return reject(new Error('Error reading from file'));
  //       }

  //       // Prepend the new jsonMessage to the existing data (or use empty string
  //       // if the file doesn't exist yet)
  //       const newData = jsonMessage + (data || '');

  //       // Write the new data to the file
  //       fs.writeFile(filePath, newData, (writeErr) => {
  //         if (writeErr) {
  //           console.error('Error writing to file:', writeErr);
  //           reject(new Error('Error writing to file'));
  //         } else {
  //           resolve();
  //         }
  //       });
  //     });
  //   }));
  // }

  // /**
  //  * Generates an XML response wrapper around the given message.
  //  *
  //  * This method takes a `jsonMessage` (or any string message) and wraps
  //  *  it in a standard XML format.
  //  * The resulting XML string includes an XML declaration and a root
  //  *  `<Response>` element that
  //  * contains the provided `jsonMessage`. This is typically used for
  //  *  returning XML responses from webhooks or APIs that expect
  //  *  XML-formatted data.
  //  *
  //  *
  //  * @param {string} jsonMessage - The message content to be wrapped in XML.
  //  * @returns {string} The XML string with the given message wrapped in a `<Response>` element.
  //  */
  // generateXmlResponse(jsonMessage) {
  //   return '<?xml version="1.0" encoding="UTF-8"?>' + '<Response>' + jsonMessage + '</Response>';
  // }

  // /**
  //  * Generates an XML error response wrapper around the given error message.
  //  *
  //  * This method takes an `errorMessage` (or any string) and wraps it in a standard
  //  *  XML error format.
  //  * The resulting XML string includes an XML declaration and a root `<Response>`
  //  *  element that
  //  * contains the provided `errorMessage`. This is typically used to return error
  //  *  messages in XML format from webhooks or APIs that expect XML-formatted
  //  *  error responses.
  //  *
  //  *
  //  * @param {string} errorMessage - The error message to be wrapped in XML.
  //  * @returns {string} The XML string with the given error message wrapped in a
  //  *  `<Response>` element.
  //  */
  // generateErrorXmlResponse(errorMessage) {
  //   return '<?xml version="1.0" encoding="UTF-8"?>' + `<Response>${errorMessage}</Response>`;
  // }
}

module.exports = new SendSMS();
