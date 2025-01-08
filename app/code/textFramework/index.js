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

  async run(app)  {
    const that = this;

    app.c('express').addRoute('textFrameworkPlugins', 'get', '/textFramework/enabled-plugins', (req, res) => {
      const plugins = that.getTextFrameworkPlugins();
      res.header('Content-Type', 'application/json');
      res.send(JSON.stringify(plugins));
    });

    return this;
  }

  /**
   * Main function that orchestrates the sending of a message via the specified plugin.
   * This function validates the plugin, retrieves the appropriate plugin handler,
   * and invokes it to send the message.
   * 
   * @param {Object} data - The data containing the plugin and message details.
   * @param {string} data.plugin - The name of the plugin to use for sending the message (e.g., 'whatsapp', 'sms').
   * @param {string} [data.message] - The message content to be sent.
   * @param {string} [data.sendTo] - The recipient phone number or contact (optional, depending on the plugin).
   * @param {string} [data.name] - Additional name or details to be included (optional, depending on the plugin).
   * 
   * @returns {Promise<Object>} - Returns a success or error object based on the outcome of the operation.
   *
   * @example
   * // Example of successful message sending
   * const result = await sendText({
   *   plugin: 'whatsapp', 
   *   message: 'Hello!', 
   *   sendTo: '<phone number>'
   * });
   * console.log(result); 
   * // Expected output: { success: ["Message sent from whatsapp plugin textFramework"] }
   * 
   * @example
   * // Example of error when plugin is not enabled
   * const result = await sendText({ plugin: 'calculator', message: 'Hello!' });
   * console.log(result); 
   * // Expected output: { errors: ["Plugin calculator is not enabled in textFramework"] }
   */
  async sendText(data) {
    const plugin = data.plugin;

    // Validate the plugin
    const validationResult = this.validatePlugin(plugin);
    if (validationResult.errors) {
      return validationResult;
    }

    // Step 2: Validate the required parameters based on the plugin
    // ** if you are supporting new message platform like messenger,signal you have to 
    // to update validateParameters method. ***
    const parameterValidationResult = this.validateParameters(plugin, data);
    if (parameterValidationResult.errors) {
      return parameterValidationResult;
    }

    // Get the plugin handler
    const moduleName = this.getPluginHandler(plugin);
    if (!moduleName) {
      return { errors: [`Plugin ${plugin} handler is not available.`] };
    }

    // Send the message using the plugin handler
    return await this.sendMessage(moduleName, data);
  }

  /**
   * Validates if the plugin is specified and enabled in the configuration.
   * 
   * @param {string} plugin - The plugin name to validate.
   * 
   * @returns {Object} - Returns an object with either errors or success.
   * - If no plugin is specified, it returns an error.
   * - If the plugin is not enabled in the configuration, it returns an error.
   *
   * @example
   * const validationResult = validatePlugin('whatsapp');
   * console.log(validationResult);
   * // Expected output: {} (empty object if plugin is valid)
   * 
   * @example
   * const validationResult = validatePlugin('nonExistentPlugin');
   * console.log(validationResult);
   * // Expected output: { errors: ["Plugin nonExistentPlugin is not enabled in textFramework"] }
   *
   */
  validatePlugin(plugin) {
    if (!plugin) {
      return { errors: ['Kindly specify plugin to send a message'] };
    }

    const plugins = this._app.config().modules['./textFramework/index.js'].plugins;
    if (!plugins[plugin]) {
      return { errors: [`Plugin ${plugin} is not enabled in textFramework`] };
    }

    return {}; // No errors if plugin is valid
  }

  getTextFrameworkPlugins() {
    return this._app.config().modules['./textFramework/index.js'].plugins;
  }

  getRequiredParams() {
    let requiredParams = {};

    const plugins = this.getTextFrameworkPlugins();
    if (!plugins) {
      return { errors: [`Plugins is not enabled in textFramework`] };
    }

    for (const pluginName in plugins) {
      if (plugins.hasOwnProperty(pluginName)) {
        requiredParams[pluginName] = plugins[pluginName].requiredParams;
      }
    }

    return requiredParams;
  }

  /**
   * Validates the required parameters for the specified plugin.
   * 
   * @param {string} plugin - The name of the plugin.
   * @param {Object} data - The data object containing the message details.
   * 
   * @returns {Object} - Returns an object with either errors or success.
   * - If a required parameter is missing, it returns an error.
   * 
   * @example
   * // Validating a message for the 'sms' plugin with missing 'sendTo'
   * const validationResult = validateParameters('sms', { plugin: 'sms', message: 'Hello!' });
   * console.log(validationResult);
   * // Expected output: { errors: ["Missing 'sendTo' parameter for sms plugin"] }
   */
  validateParameters(plugin, data) {
    const requiredParams = this.getRequiredParams();
    console.log(requiredParams);

    const required = requiredParams[plugin];
    if (!required) {
      return { errors: [`Plugin ${plugin} is not supported for parameter validation`] };
    }

    for (const param of required) {
      if (!data[param]) {
        return { errors: [`Missing '${param}' parameter for ${plugin} plugin`] };
      }
    }

    // No errors if all required parameters are provided
    return {};
  }

  /**
   * Retrieves the plugin handler function from the configuration based on the plugin name.
   * 
   * @param {string} plugin - The plugin name to get the handler for.
   * 
   * @returns {Function|null} - Returns the plugin handler if available, otherwise null.
   *
   * @example
   * const handler = getPluginHandler('whatsapp');
   * console.log(handler);
   * // Expected output: [Function] (the handler function for whatsapp plugin)
   * 
   * @example
   * const handler = getPluginHandler('nonExistentPlugin');
   * console.log(handler);
   * // Expected output: null (if no handler is found for the plugin)
   *
   */
  getPluginHandler(plugin) {
    const plugins = this.getTextFrameworkPlugins();
    const pluginConfig = plugins[plugin];

    if (pluginConfig && pluginConfig.plugin) {
      return pluginConfig.plugin;
    }

    return null;
  }

  /**
   * Sends the message using the provided plugin handler.
   * 
   * @param {Function} module - The module handles the sending of the message.
   * @param {Object} data - The data containing the message details.
   * 
   * @returns {Promise<Object>} - Returns a success message after sending the text.
   *
   * @example
   * const handler = getPluginHandler('whatsapp');
   * const messageData = { plugin: 'whatsapp', message: 'Hello!', sendTo: '+<Phone number>' };
   * const result = await sendMessage(handler, messageData);
   * console.log(result);
   * // Expected output: { success: ["Message sent from whatsapp plugin textFramework"] }
   * 
   * @example
   * const handler = getPluginHandler('sms');
   * const messageData = { plugin: 'sms', message: 'Test SMS', sendTo: '+<Phone number>' };
   * const result = await sendMessage(handler, messageData);
   * console.log(result);
   * // Expected output: { success: ["Message sent from sms plugin textFramework"] }
   *
   */
  async sendMessage(module, data) {
    try {
      // Convert data to JSON string and send it via the plugin handler
      await this._app.c(module).sendText(JSON.stringify(data));
      return { success: [`Message sent from ${data.plugin} plugin textFramework`] };
    } catch (error) {
      // If there's an error during message sending, catch and return error
      return { errors: [`Error sending message using ${data.plugin}: ${error.message}`] };
    }
  }

}

// Export an instance of the TextFramework class.
module.exports = new TextFramework();
