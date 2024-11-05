// @ts-check
// The TypeScript engine will check all JavaScript in this file.

/**
 * In order to send Whatsapp message ensure valid TWILIO_USER, TWILIO_PASS, FROM_NUM
 * DEV_MODE values present in .env file.
 *
 * If DEV_MODE=true then the message is saved to file ./unversioned/output/whatsapp-send.json
 * If DEV_MODE=false then the message is send to respective sendTo number.
 *
 * Ensure DEV_MODE=true in dev mode.
 *
 * Test whatsapp message sending functionality in terminal.
 *
 * access nodejs client ./scripts/node-cli.sh
 * Run below code by replacing country code and phone number.
 * >> await app.c('whatsAppSend').parsepropertySendMessage('{"message": "", "sendTo":"<country code><phone number>"}');
 *
 * example:-
 * >> await app.c('whatsAppSend').parsepropertySendMessage('{"message": "This is a test message", "sendTo":"+150XXXXXXX"}');
 *
 * Test whatsapp message sending functionality using curl.
 *
 * In dev environment:-
 * If you are a authorised user then access .env and copy WHATSAPPSENDM_API_TOKEN value and replace in below command.
 * >> curl -X POST --data '{"message": "This is a test", "sendTo":"91XXXXXXXXX"}' http://0.0.0.0:8792/whatsappmessage/send/<WHATSAPPSENDM_API_TOKEN>
 *
 * In test environment:-
 * >> curl -X POST --data '{"message": "This is a test", "sendTo":"91XXXXXXXXXX"}' https://whatsapp-communication.dcycleproject.org/whatsappmessage/send/<WHATSAPPSENDM_API_TOKEN>
 *
 */

/**
 * Sending whatsapp messages functionality.
 *
 * ** note **
 * whatsapp messages are sent only in https enviroment.
 * Authentication failure Errors are logged in http environment.
 */
class WhatsAppSend extends require('../component/index.js') {

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
      'whatsappSend',
      // HTTP method for this route.
      'post',
      // Route pattern.
      // http://0.0.0.0:8792/whatsappmessage/send
      '/whatsappmessage/send/:token',
      async (req, res) => {
        await this.handleRequest(req, res);
      }
    );

    // Return the instance of the class.
    return this;
  }

  /**
   * Handles incoming requests to send a WhatsApp message.
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
        return res.status(500).send('Missing required parameters: sendTo and/or message or if media url is set it should be a valid url.');
      }

      const result = await this.sendWhatasppMessage(messageObject);
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
    const expectedToken = String(require('../env/index.js').required('WHATSAPPSENDM_API_TOKEN'));
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
   * >> await app.c('whatsAppSend').sendWhatasppMessage('{"message": "", "sendTo":"<country code><phone number>"}');
   *
   * parameter are not in json. we need to convert it to json.
   */
  async parsepropertySendMessage(messageObject) {

    // If messageObject is a string, convert it to the desired object pattern.
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
      return "May be Missing required parameters: sendTo and/or message or else if media url is set it should be valid url";
    }
    else {
      return await this.sendWhatasppMessage(parsedObject);
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
   async sendWhatasppMessage(messageObject) {
    try {
      /**
       * DEV_MODE=false then message sending functionality executed.
       * else messages are written to ./unversioned/output/whatsapp-send.json file.
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
   * Sends a WhatsApp message using the Twilio API.
   * @param {Object} messageObject - The message object containing the message details.
   */
  async sendMessage(messageObject) {
    try {
      // Load Twilio helper library to send WhatsApp message
      // @ts-expect-error
      const twilio = require("twilio");

      // Load Twilio credentials and WhatsApp sending number
      const twilioUser = this.app().c('env').required('TWILIO_USER');
      const authToken = this.app().c('env').required('TWILIO_PASS');
      const whatsappFrom = this.app().c('env').required('FROM_NUM');

      // Authenticate with Twilio
      const client = twilio(twilioUser, authToken);

      let clientMessage = {
        body: messageObject.message,
        from: "whatsapp:" + whatsappFrom,
        to: "whatsapp:" + messageObject.sendTo
      };

      // Check if mediaUrl is set and add it to the clientMessage object
      if (messageObject.mediaUrl) {
        clientMessage.mediaUrl = messageObject.mediaUrl;
      }

      // Send the message
      await client.messages.create(clientMessage);

      console.log('Message sent successfully');
      return true;

    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
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

      await fs.writeFile('/output/whatsapp-send.json', jsonMessage, (err) => {
        if (err) {
          console.log("WhatsApp send message Coudn't be Written to file. " + err);
          return false;
        }
        console.log("WhatsApp send message written to file successfully");
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

    // media url should be valid url.
    if (typeof parsedObject.mediaUrl === 'string' && parsedObject.mediaUrl.trim() !== '') {
      if (!this.isValidUrl(parsedObject.mediaUrl)) {
        return false;
      }
    }

    // Check if 'message' and 'sendTo' are both present and sendTo non-empty string
    const hasValidMessage = typeof parsedObject.message === 'string';
    const hasValidSendTo = typeof parsedObject.sendTo === 'string' && parsedObject.sendTo.trim() !== '';

    // Return true only if both 'message' and 'sendTo' are valid
    return hasValidMessage && hasValidSendTo;
  }

  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }

}

module.exports = new WhatsAppSend();
