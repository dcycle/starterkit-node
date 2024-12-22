// @ts-check
// The TypeScript engine will check all JavaScript in this file.

/**
 * TextFramework functionality.
 */
class TextFramework extends require('../component/index.js') {

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
   * Send message from respective plugin.
   * @param {Object} data The data object containing plugin, message, sendTo.
   * @returns returns none.
   */
  async sendText(data) {
    let { plugin } = data;
    // Validate input parameters
    if (!plugin) {
      return { errors: ['Kindly specify plugin to send a message'] };
    }
    // Get all Plugins enabled for the textFramework module.
    const plugins = this._app.config().modules['./textFramework/index.js'].plugins;
    // Check if the plugin is enabled
    if (plugins[plugin]) {
      // If the plugin exists, invoke the respective plugin
      if (plugins[plugin].plugin) {
        const messegeHandler = plugins[plugin].plugin;
        await this._app.c(messegeHandler).sendText(JSON.stringify(data));
        return { sucess: [`Message sent from ${plugin} plugin textFramework`] };
      }
    } else {
      // Return error if plugin is not enabled
      return { errors: [`Plugin ${plugin} is not enabled in textFramework`] };
    }
  }

}

// Export an instance of the TextFramework class.
module.exports = new TextFramework();
