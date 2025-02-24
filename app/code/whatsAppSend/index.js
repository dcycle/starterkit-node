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
 * If you are a authorised user then access .env and copy AUTH_API_TOKEN value and replace in below command.
 * >> curl -X POST --data '{"message": "This is a test", "sendTo":"91XXXXXXXXX"}' http://0.0.0.0:8792/whatsappmessage/send/<AUTH_API_TOKEN>
 *
 * In test environment:-
 * >> curl -X POST --data '{"message": "This is a test", "sendTo":"91XXXXXXXXXX"}' https://whatsapp-communication.dcycleproject.org/whatsappmessage/send/<AUTH_API_TOKEN>
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
      const isValidToken = this.app().c('helpers').validateToken(token, 'AUTH_API_TOKEN');
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
   * Sends a WhatsApp message. The behavior differs based on the `DEV_MODE` environment variable.
   * 
   * - If `DEV_MODE` is set to `"false"`, the message is sent using the `sendMessage` function.
   * - If `DEV_MODE` is set to any other value (e.g., `"true"`), the message is written to a JSON file (`./unversioned/output/whatsapp-send.json`) for later processing, without sending the message.
   * 
   * @param {Object} messageObject - The message object containing the details of the WhatsApp message to send. 
   *                                It typically includes properties such as `to`, `body`, and potentially `mediaUrl`.
   * 
   * @returns {Promise<boolean>} - A Promise that resolves with:
   *   - `true` if the message was successfully sent (or saved to a file if in dev mode).
   *   - `false` if an error occurred or the message could not be sent or saved.
   * 
   * @throws {Error} - If there is an unexpected error in the process, the function will log the error and return `false`.
   * 
   * @example
   * const messageObject = {
   *   to: "+1234567890", 
   *   body: "Hello, this is a test message!"
   * };
   * 
   * async function sendMessage() {
   *   const success = await sendWhatsappMessage(messageObject);
   *   if (success) {
   *     console.log('Message successfully sent!');
   *   } else {
   *     console.log('Failed to send message.');
   *   }
   * }
   * 
   * sendMessage();
   */
   async sendWhatasppMessage(messageObject) {
    try {
      /**
       * DEV_MODE=false then message sending functionality executed.
       * else messages are written to ./unversioned/output/whatsapp-send.json file.
       *
       * Ensure DEV_MODE="true" in dev mode.
       */
      // Set isDevMode = false if DEV_MODE="true" is not set in .env file.
      const isDevMode = this.app().c('env').required('DEV_MODE') === "true" || false;
      if (isDevMode) {
        const filePath = '/output/whatsapp-send.json';
        const jsonMessage = JSON.stringify(messageObject);
        const res = await this.app().c('helpers').writeToFile(jsonMessage, filePath);
        return res;
      } else {
        return await this.sendMessage(messageObject);
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
      const messageStatus = await client.messages.create(clientMessage);
      return messageStatus;

    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
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
