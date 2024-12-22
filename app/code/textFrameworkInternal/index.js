// @ts-check
// The TypeScript engine will check all JavaScript in this file.

/**
 * TextFrameworkInternal functionality.
 */
class TextFrameworkInternal extends require('../component/index.js') {

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
   * Sends a text message to the chat service.
   * 
   * This asynchronous method sends the provided message data to the chat system
   * using the `addMessage` method from the chat service.
   *
   * @async
   * @param {Object} data - The message data to be sent. This typically contains the message content, sender, etc.
   * @returns {Promise<void>} A promise that resolves when the message is successfully added.
   * 
   * @throws {Error} If the message cannot be sent due to any failure in the chat service.
   */
  async sendText(data) {
    await this._app.c('chat').addMessage(data);
  }

  dependencies() {
    return [
      './chat/index.js',
    ];
  }
}

module.exports = new TextFrameworkInternal();
