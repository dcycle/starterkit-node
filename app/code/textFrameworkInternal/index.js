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
