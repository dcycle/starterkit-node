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
