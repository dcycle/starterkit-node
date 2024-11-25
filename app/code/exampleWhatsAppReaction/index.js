// @ts-check
// The TypeScript engine will check all JavaScript in this file.

/**
 *  ExampleWhatsAppReaction is an example to demonstrate observer functionality.
 */
 class ExampleWhatsAppReaction extends require('../component/index.js') {

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

  async run(app) {
    app.c('observers').addObserver({
      "module": "webhookWhatsApp",
      "verb": "receiveMessage",
      // * for all phone numbers, or else specify a phone number.
      "applyTo": "+919632324012,+15146779578",
      "callback": "processReceivedMessage",
      // or never, or a date...
      "expire": "+1 hour",
    });

    // Return the instance of the class
    return this;
  }

}

module.exports = new ExampleWhatsAppReaction();
