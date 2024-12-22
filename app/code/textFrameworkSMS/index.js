// @ts-check
// The TypeScript engine will check all JavaScript in this file.

/**
 * TextFrameworkSMS functionality.
 */
class TextFrameworkSMS extends require('../component/index.js') {

  /**
   * Initializes the TextFramework instance with necessary database schema.
   * @property {Function} init Initializes this object.
   * @returns TextFramework
   */
   async init(app) {
    // Call the parent class's init method.
    super.init(app);

    // Return the initialized chatbot instance.
    return this;
  }

  /**
   * Sends a text message by parsing the provided data using the `parsepropertySendSMS` method.
   * 
   * This asynchronous method passes the provided data to the `sendSMS` service for processing 
   * and sending the SMS. The data is expected to be in a format that can be parsed by 
   * `parsepropertySendSMS`.
   *
   * @async
   * @param {Object} data - The data required for sending the SMS. This object may include
   *                         details such as the recipient's phone number, message content, etc.
   * @returns {Promise<void>} A promise that resolves when the SMS has been processed successfully.
   * 
   * @throws {Error} If the SMS cannot be sent or if there is an error while parsing the data.
   */
  async sendText(data) {
    await this._app.c('sendSMS').parsepropertySendSMS(data);
  }

  dependencies() {
    return [
      './sendSMS/index.js',
    ];
  }
}

module.exports = new TextFrameworkSMS();
