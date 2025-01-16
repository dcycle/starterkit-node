// @ts-check
// The TypeScript engine will check all JavaScript in this file.

/**
 * TextFrameworkWhatsApp functionality.
 */
class TextFrameworkWhatsApp extends require('../component/index.js') {

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
   * Sends a WhatsApp message by parsing the provided data using the `parsepropertySendMessage` method.
   *
   * This asynchronous method takes the provided `data` object and passes it to the `whatsAppSend` service 
   * for processing and sending the message. The data is expected to be in a format that is compatible 
   * with the `parsepropertySendMessage` method.
   *
   * @async
   * @param {Object} data - The data required to send a WhatsApp message. This may include the recipient's 
   *                         phone number, message content, media attachments, etc.
   * @returns {Promise<void>} A promise that resolves when the message has been successfully processed and sent.
   * 
   * @throws {Error} If the message cannot be sent, or if an error occurs during data parsing or communication 
   *                 with the WhatsApp service.
   */
  async sendText(data) {
    return await this._app.c('whatsAppSend').parsepropertySendMessage(data);
  }

  dependencies() {
    return [
      './whatsAppSend/index.js',
    ];
  }
}

module.exports = new TextFrameworkWhatsApp();
