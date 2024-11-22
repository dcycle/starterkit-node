// @ts-check
// The TypeScript engine will check all JavaScript in this file.

/**
 * Whatsapp messages storing functionality.
 */
class WebhookWhatsApp extends require('../component/index.js') {

  /**
   * @property {Function} init Initializes this object.
   * @returns WebhookWhatsApp
   */
  async init(app)  {
    super.init(app);

    this.message = app.component('./database/index.js').mongoose().model('whatsappMessages', {
      SmsMessageSid: { type: String, required: true },
      NumMedia: { type: Number, required: true },
      ProfileName: { type: String, required: true },
      MessageType: { type: String, required: true }, // e.g., "text", "image", "video"
      SmsSid: { type: String, required: true },
      WaId: { type: String, required: true },
      SmsStatus: { type: String, required: true },
      Body: { type: String, default: '' },
      To: { type: String, required: true },
      NumSegments: { type: Number, required: true },
      ReferralNumMedia: { type: Number, default: 0 },
      MessageSid: { type: String, required: true },
      AccountSid: { type: String, required: true },
      From: { type: String, required: true },
      MediaContentType0: { type: String, default: '' }, // Optional, only for media messages
      MediaUrl0: { type: String, default: '' }, // Optional, only for media messages
      Forwarded: { type: Boolean, default: false }, // Optional, true if forwarded
      ApiVersion: { type: String, required: true }
    });

    return this;
  }

  // https://github.com/jshint/jshint/issues/3361
  /* jshint ignore:start */
  message;
  /* jshint ignore:end */

  /**
   * Returns the dependencies.
   * @returns {String[]}
   */
  dependencies() {
    return [
      // Dependency on express module
      './express/index.js',
      './database/index.js',
      './bodyParser/index.js',
      './env/index.js'
    ];
  }

  collection() {
    return this.app().c('database').client()
      .db('login')
      .collection('whatsappMessages');
  }

  /**
   * Fetch the "whatsappMessages" model.
   */
   whatsappMessages() {
    // Sample usage:
    // this.whatsappMessages().find({},(err, messages)=> {
    //   return messages;
    // });

    return this.message;
  }

  /** Return true if the AccountSid is equivalent to the TWILIO_USER in .env */
  validateAuthenticatedMessage(
    messageObject /*:: : Object */
  ) {
    if (messageObject.AccountSid != undefined) {
      const twilioUser = this.app().c('env').required('TWILIO_USER');
      return messageObject.AccountSid === twilioUser;
    }
    else {
      return false;
    }
  }

  /**
   * Stores a WhatsApp message object in the whatsappMessages collection database.
   *
   * This method takes a message object, processes it, and stores it in the database.
   * It uses the `whatsappMessages` function to prepare the message before saving it.
   * If the save operation is successful, the ID of the saved message is returned.
   * If there is an error during the process, it is handled appropriately
   * and an error is thrown.
   *
   * @param {Object} messageObject - The message object containing the details
   * to be stored in the database.
   * @returns {Promise<string | boolean>} A promise that resolves to the ID of the
   *  saved message (string) or `false` if there was an error.
   * @throws {Error} Throws an error if there is a validation error or a general
   *  error during the saving process.
   */
  async storeInMessageDetail(
   /*:: : Object */
    messageObject
  ) {
    try {
      const message = await this.whatsappMessages()(messageObject);
      return message.save().then(async (value)=> {
        console.log("!! whatsapp message saved to database !!");
        return value.id;
      }).catch((err)=>{
        console.log(err);
        return false;
      });
    } catch (error) {
      // Handle Mongoose validation errors
      if (error.name === 'ValidationError') {
        console.error('Validation Error:', error.message);
        throw new Error('Validation error occurred while saving message details.');
      }
      // Handle other types of errors
      console.error('Error saving message:', error);
      throw new Error('An error occurred while saving message details.');
    }
  }

  // Initialization method to set up middleware and routes
  async run(app) {
    app.c('express').addRoute(
      'webhookWhatsApp',
      // HTTP method for this route
      'post',
      // Route pattern with dynamic permissionId and file path
      '/webhook/whatsapp',
      async (req, res) => {
        await this.handleIncomingMessage(req, res);
    });
    // Return the instance of the class
    return this;
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
  async handleIncomingMessage(req, res) {
    try {
      const jsonMessage = JSON.stringify(req.body);

      // Write the incoming message to file.
      await this.writeToFile(jsonMessage);

      const messageObject = req.body;
      // if account sid is eqaul to twillio user then only store in db.
      if (this.validateAuthenticatedMessage(messageObject)) {
        let toNumber = req.body.WaId;
        // prepend + to phone number.
        toNumber = '+' + toNumber;
        // Fetch and Run observers related to webhookWhatsApp.
        await this.app().c('observers').runObservers(
          {
            "module": "webhookWhatsApp",
            "verb": "receiveMessage",
            $or: [
              // Match all observers if applyTo is "*"
              { applyTo: '*' },
              // prepend + to phonenumber country code.
              { applyTo: { $in: toNumber.split(',') } }
            ]
          },
          // paramter to pass in to callback function.
          {
            "messageObject": messageObject,
            "number": "+" + toNumber,
            "message": "!! WELL RECIEVED !!"
          }
        );
        // Respond with the original message
        const resp = this.generateXmlResponse(jsonMessage);
        res.status(200).send(resp);
      } else {
        console.log("Message is not from allowed ssid " + messageObject.AccountSid);
        const resp = this.generateErrorXmlResponse("Message is not from allowed to save from this account ssid " + messageObject.AccountSid);
        res.status(403).send(resp);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorResp = this.generateErrorXmlResponse("Internal Server Error");
      res.status(500).send(errorResp);
    }
  }

  /**
   * Writes a given message to a file, prepending it to the beginning of the file content.
   *
   * This method reads the current contents of the file, prepends the new `jsonMessage`
   * to the beginning,
   * and then writes the updated content back to the file. If the file does not exist,
   * it will be created.
   *
   * @param {string} jsonMessage - The message to be written to the file.
   * @returns {Promise<void>} A promise that resolves when the file has been updated
   * successfully or rejects if there is an error.
   */
  async writeToFile(jsonMessage) {
    return /** @type {Promise<void>} */(new Promise((resolve, reject) => {
      // @ts-expect-error
      const fs = require('fs');
      const filePath = '/output/whatsapp.json';

      // Read the current contents of the file
      fs.readFile(filePath, 'utf8', (readErr, data) => {
        if (readErr && readErr.code !== 'ENOENT') {
          // If the file exists and there's an error reading it, reject with an error
          console.error('Error reading from file:', readErr);
          return reject(new Error('Error reading from file'));
        }

        // Prepend the new jsonMessage to the existing data (or use empty string
        // if the file doesn't exist yet)
        const newData = jsonMessage + (data || '');

        // Write the new data to the file
        fs.writeFile(filePath, newData, (writeErr) => {
          if (writeErr) {
            console.error('Error writing to file:', writeErr);
            reject(new Error('Error writing to file'));
          } else {
            resolve();
          }
        });
      });
    }));
  }

  /**
   * Generates an XML response wrapper around the given message.
   *
   * This method takes a `jsonMessage` (or any string message) and wraps
   *  it in a standard XML format.
   * The resulting XML string includes an XML declaration and a root
   *  `<Response>` element that
   * contains the provided `jsonMessage`. This is typically used for
   *  returning XML responses from webhooks or APIs that expect
   *  XML-formatted data.
   *
   *
   * @param {string} jsonMessage - The message content to be wrapped in XML.
   * @returns {string} The XML string with the given message wrapped in a `<Response>` element.
   */
  generateXmlResponse(jsonMessage) {
    return '<?xml version="1.0" encoding="UTF-8"?>' + '<Response>' + jsonMessage + '</Response>';
  }

  /**
   * Generates an XML error response wrapper around the given error message.
   *
   * This method takes an `errorMessage` (or any string) and wraps it in a standard
   *  XML error format.
   * The resulting XML string includes an XML declaration and a root `<Response>`
   *  element that
   * contains the provided `errorMessage`. This is typically used to return error
   *  messages in XML format from webhooks or APIs that expect XML-formatted
   *  error responses.
   *
   *
   * @param {string} errorMessage - The error message to be wrapped in XML.
   * @returns {string} The XML string with the given error message wrapped in a
   *  `<Response>` element.
   */
  generateErrorXmlResponse(errorMessage) {
    return '<?xml version="1.0" encoding="UTF-8"?>' + `<Response>${errorMessage}</Response>`;
  }

}

module.exports = new WebhookWhatsApp();
