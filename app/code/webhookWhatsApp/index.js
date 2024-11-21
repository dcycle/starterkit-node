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

  /** Store a message */
  async storeInMessageDetail(
    messageObject /*:: : Object */
  ) {
    try {
      const message = await this.whatsappMessages()(messageObject);
      message.save().then(async (value)=> {
        console.log("!! whatsapp message saved to database !!");
      }).catch((err)=>{
        console.log(err);
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

  async handleIncomingMessage(req, res) {
    try {
      const jsonMessage = JSON.stringify(req.body);

      // Write the incoming message to file
      await this.writeToFile(jsonMessage);

      // Save to MongoDB after writing to file
      const messageObject = req.body;
      if (this.validateAuthenticatedMessage(messageObject)) {
        const FromNumber = req.bodyWaId;
        const observers = await this.getObservers(FromNumber);

        if (Array.isArray(observers)) {
          await this.handleObservers(observers, messageObject, FromNumber);
        } else {
          console.error('Observers is not an array:', observers);
        }

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
  };

  // Write the message to a file
  writeToFile(jsonMessage) {
    return /** @type {Promise<void>} */(new Promise((resolve, reject) => {
      // @ts-expect-error
      const fs = require('fs');
      fs.writeFile('/output/whatsapp.json', jsonMessage, (err) => {
        if (err) {
          console.error('Error writing to file:', err);
          reject(new Error('Error writing to file'));
        } else {
          resolve();
        }
      });
    }));
  }

  // Get the observers based on the `FromNumber`
  async getObservers(FromNumber) {
    return await this.app().c('observers').observers({
      "module": "webhookWhatsApp",
      "verb": "receiveMessage",
      "applyTo": FromNumber
    });
  }

  // Handle each observer callback
  async handleObservers(observers, messageObject, FromNumber) {
    for (const observer of observers) {
      const applyToPattern = observer.applyTo === "*" ? ".*" : observer.applyTo;
      const regex = new RegExp(applyToPattern);

      if (regex.test(FromNumber)) {
        observer.callback({
          "messageObject": messageObject,
          "number": FromNumber,
          "message": "!!! Well received !!!"
        });
      }
    }
  }

  // Generate XML response
  generateXmlResponse(jsonMessage) {
    return '<?xml version="1.0" encoding="UTF-8"?>' + '<Response>' + jsonMessage + '</Response>';
  }

  // Generate error XML response
  generateErrorXmlResponse(errorMessage) {
    return '<?xml version="1.0" encoding="UTF-8"?>' + `<Response>${errorMessage}</Response>`;
  }

}

module.exports = new WebhookWhatsApp();
