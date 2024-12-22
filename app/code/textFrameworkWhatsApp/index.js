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

  async sendText(data) {
    await this._app.c('whatsAppSend').parsepropertySendMessage(data);
  }

  dependencies() {
    return [
      './whatsAppSend/index.js',
    ];
  }
}

module.exports = new TextFrameworkWhatsApp();
