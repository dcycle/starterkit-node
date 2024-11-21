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
      (req, res) => {
        // @ts-expect-error
        const fs = require('fs');
        const jsonMessage = JSON.stringify(req.body);

        // Write to file first
        fs.writeFile('/output/whatsapp.json', jsonMessage, async (err) => {
          if (err) {
            console.error('Error writing to file:', err);
            const errorResp = '<?xml version="1.0" encoding="UTF-8"?><Response>Error writing to file: Internal Server Error</Response>';
            res.status(500).send(errorResp);            
          }

          // Save to MongoDB after writing to file.
          try {
            let messageObject = req.body;
            if (this.validateAuthenticatedMessage(messageObject)) {
              app.c ('observers').addObserver({
                "module": "webhookWhatsApp",
                "verb": "receiveMessage",
                // * for all phone numbers, or else specify a phone number.
                "applyTo": "*",
                "callback": async function(details) {
                await this.storeInMessageDetail(details.messageObject);
                // Send Confirmation message.
                await app.c('whatsAppSend').parsepropertySendMessage('{"message": "!!! Well received !!!", "sendTo":"' + details.number + '"}');
                },
                // or never, or a date...
                "expire": "+1 hour",
              });
              // https://stackoverflow.com/questions/68508372
              const resp = '<?xml version="1.0" encoding="UTF-8"?><Response>' + jsonMessage + '</Response>';
              res.status(200).send(resp);
            }
            else {
              console.log("Message is not from allowed ssid " + messageObject.AccountSid);
              let resp = '<?xml version="1.0" encoding="UTF-8"?>';
              resp += '<Response> Message is not from allowed to save from this account ssid ' + messageObject.AccountSid  + '</Response>';
              res.status(403).send(resp);
            }
          } catch (error) {
            console.error('Error saving message:', error);
            const errorResp = '<?xml version="1.0" encoding="UTF-8"?><Response>Internal Server Error</Response>';
            res.status(500).send(errorResp);
          }
        });
      }
    );

    // Return the instance of the class
    return this;
  }

}

module.exports = new WebhookWhatsApp();
