// @ts-check
// The TypeScript engine will check all JavaScript in this file.

/**
 * SMS storing functionality.
 */
class WebhookSMS extends require('../component/index.js') {

  /**
   * @property {Function} init Initializes this object.
   * @returns WebhookSMS
   */
  async init(app)  {
    super.init(app);

    this.sms = app.component('./database/index.js').mongoose().model('sms', {
      SmsMessageSid: { type: String, required: true },
      SmsSid: { type: String, required: true },
      SmsStatus: { type: String, required: true },
      Body: { type: String, required: true },
      From: { type: String, required: true },
      FromCity: { type: String, default: '' },
      FromState: { type: String, required: true },
      FromCountry: { type: String, required: true },
      FromZip: { type: String, default: '' },
      To: { type: String, required: true },
      ToCity: { type: String, default: '' },
      ToState: { type: String, required: true },
      ToCountry: { type: String, required: true },
      ToZip: { type: String, default: '' },
      NumMedia: { type: Number, required: true },
      NumSegments: { type: Number, required: true },
      AccountSid: { type: String, required: true },
      ApiVersion: { type: String, required: true },
      MessageSid: { type: String, required: true }
    });

    return this;
  }

  // https://github.com/jshint/jshint/issues/3361
  /* jshint ignore:start */
  sms;
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
      .collection('sms');
  }

  /**
   * Fetch the "sms" model.
   */
   smsMessages() {
    // Sample usage:
    // this.smsMessages().find({},(err, smses)=> {
    //   return smses;
    // });

    return this.sms;
  }

  /** Store a sms */
  async storeSMS(
    smsObject /*:: : Object */
  ) {
    try {
      const sms = await this.smsMessages()(smsObject);
      sms.save().then(async (value)=> {
        console.log("!! sms saved to database !!");
      }).catch((err)=>{
        console.log(err);
      });
    } catch (error) {
      // Handle Mongoose validation errors
      if (error.name === 'ValidationError') {
        console.error('Validation Error:', error.message);
        throw new Error('Validation error occurred while saving sms.');
      }
      // Handle other types of errors
      console.error('Error saving message:', error);
      throw new Error('An error occurred while saving sms.');
    }
  }

  // Initialization method to set up middleware and routes
  async run(app) {
    app.c('express').addRoute(
      'webhookSMS',
      // HTTP method for this route
      'post',
      // Route pattern with dynamic permissionId and file path
      '/webhook/twilio-sms',
      async (req, res) => {
        // @ts-expect-error
        const fs = require('fs');
        const jsonMessage = JSON.stringify(req.body);
        
        const filePath = '/output/sms.json';
        try {
          await this.app().c('helpers').writeToFile(jsonMessage, filePath);

          // Save to MongoDB after writing to file.
          let smsObject = req.body;
          if (this.app().c('helpers').validateAuthenticatedMessage(smsObject)) {
            await this.storeSMS(smsObject);
            // Send Confirmation sms.
            await app.c('sendSMS').parsepropertySendSMS('{"message": "!!! Well received !!!", "sendTo":"' + req.body.From + '"}');
            // https://stackoverflow.com/questions/68508372
            const resp = '<?xml version="1.0" encoding="UTF-8"?><Response>' + jsonMessage + '</Response>';
            res.status(200).send(resp);
          }
          else {
            console.log("Message is not from allowed ssid " + smsObject.AccountSid);
            let resp = '<?xml version="1.0" encoding="UTF-8"?>';
            resp += '<Response> Message is not from allowed to save from this account ssid ' + smsObject.AccountSid  + '</Response>';
            res.status(403).send(resp);
          }
        } catch (error) {
          console.error('Error saving message:', error);
          const errorResp = '<?xml version="1.0" encoding="UTF-8"?><Response>Internal Server Error</Response>';
          res.status(500).send(errorResp);
        }

      }
    );

    // Return the instance of the class
    return this;
  }

}

module.exports = new WebhookSMS();
