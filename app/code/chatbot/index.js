// @ts-check
// The TypeScript engine will check all JavaScript in this file.

/**
 * Chatbot functionality.
 */
 class Chatbot extends require('../component/index.js') {
  /**
   * Initializes the Chatbot instance with necessary database schema.
   * @property {Function} init Initializes this object.
   * @returns Chatbot
   */
  async init(app) {
    // Call the parent class's init method.
    super.init(app);
    // Import mongoose from the database component.
    const Schema = app.component('./database/index.js').mongoose().Schema;

    // Define the schema for chatbot conversations.
    const ChatbotConSchema = new Schema({
      plugin: { type: String, required: true },
      conversationId: { type: String, required: true },
      userInput: { type: String, required: true },
      result: { type: String, required: true },
    }, {
      // Add timestamps for createdAt and updatedAt.
      timestamps: true
    });

    // Create a model for chatbot conversations using the defined schema.
    this.chatbotconversation = app.component('./database/index.js').mongoose().model('ChatbotConversations', ChatbotConSchema);
    // Store the app reference for later use.
    this._app = app;

    // Return the initialized chatbot instance.
    return this;
  }

  // Ignore JSHint for the chatbotconversation property
  /* jshint ignore:start */
  chatbotconversation;
  /* jshint ignore:end */

  /**
   * Returns the dependencies required by the chatbot.
   * @returns {String[]} Array of dependency paths.
   */
  dependencies() {
    return [
      // Database component dependency
      './database/index.js',
      // UUID library dependency
      'uuid'
    ];
  }

  /**
   * Get the MongoDB collection for chatbot conversations.
   * @returns {Object} The ChatbotConversations collection.
   */
  collection() {
    return this.app().c('database').client()
      // Use the 'login' database
      .db('login')
      // Access the 'ChatbotConversations' collection
      .collection('chatbotconversations');
  }

  /**
   * Fetch the "chatbotconversations" model.
   * @returns {function} The chatbot conversation model.
   *   This is a function, but also contains a property "find" which itself is
   *   a function. Therefore if you run ./scripts/node-cli.sh, you can do:
   *     typeof app.c('chatbot').allChatBotConversations;
   *     # 'function'
   *     typeof app.c('chatbot').allChatBotConversations().find;
   *     # 'function'
   *   Therefore this function acts like an object sometimes.
   */
  allChatBotConversations() {
    // Returns the chatbot conversation model for querying.
    return this.chatbotconversation;
  }

  /**
   * Handle a chat prompt and process the conversation.
   * @param {Object} prompt The chat prompt object containing plugin, text, and conversationId.
   * @returns Response with the result or errors.
   */
  async chat(prompt) {
    // Destructure prompt for easier access.
    let { plugin, text, conversationId } = prompt;
    // Validate input parameters.
    if (!plugin && !conversationId) {
      return { errors: ['Specify either a plugin or a conversationId'] };
    }

    // Retrieve previous conversation if conversationId is provided.
    let previous = await this.getPreviousConversation(conversationId);
    let previousResult = 0;
    if (previous.length > 0) {
      // Get the plugin from the previous conversation.
      plugin = previous[0].plugin;
      previousResult = previous[0].result;
    }
    else if (!plugin) {
      return { errors: [ 'Conversation not found this id ' + conversationId] };
    }
    // Plugins enabled for Chatbot module.
    const plugins = this._app.config().modules['./chatbot/index.js'].plugins;
    if (plugins[plugin]) {
      // Invoke respective plugins.
      const result = await this._app.c(plugins[plugin].plugin).getResult(text.trim(), previousResult);
      return this.createAndStoreResponse(result, text.trim(), conversationId, plugin);
    }
    else {
      // Return error if plugin is not found.
      return { errors: [`Plugin ${plugin} does not exist`] };
    }
  }

  /**
   * Get the previous conversation based on conversationId.
   * @param {String} conversationId The ID of the conversation to retrieve.
   * @returns The previous conversation entries.
   */
  async getPreviousConversation(conversationId) {
    if (conversationId) {
      // @ts-ignore
      return await this.allChatBotConversations().find({ 'conversationId': conversationId }).sort({ createdAt: -1 }).limit(1);
    }
    return [];
  }

  /**
   * Get a UUID.
   *
   * @returns string
   *   A UUID.
   */
  uuid() {
    // Import UUID for generating unique conversation IDs.
    // @ts-ignore
    const { v4: uuidv4 } = require('uuid');
    return uuidv4();
  }

  /**
   * Create response and store it in db.
   * @param {Object} result Response from plugins.
   * @param {String} text The input text for the plugin.
   * @param {String} conversationId The previous conversation ids.
   * @param {String} plugin Name of a plugin.
   * @returns The response object with the plugins result.
   */
  async createAndStoreResponse(result, text, conversationId, plugin) {
    try {
      const response = {
        result,
        // Generate a new conversation ID.
        conversationId: conversationId || this.uuid(),
      };

      if (result !== 'Invalid expression') {
        // Save the conversation to the database.
        await this.storeConversation({
          plugin: plugin,
          conversationId: response.conversationId,
          userInput: text,
          result: response.result,
        });
      }
      // Return the successful response.
      return response;

    } catch (error) {
      // Return error message if fails.
      return { errors: [error.message] };
    }
  }

  /**
   * Store a conversation in the database.
   * @param {Object} conversation The conversation object to save.
   * @throws Will throw an error if saving fails.
   */
  async storeConversation(conversation) {
    try {
      // Create a new conversation instance.
      const newConversation = this.allChatBotConversations()(conversation);
      // Save the conversation in the database.
      await newConversation.save();
      // Log successful save.
      console.log("Conversation saved to database!");

    } catch (error) {
      // Handle Mongoose validation errors.
      if (error.name === 'ValidationError') {
        console.error('Validation Error:', error.message);
        throw new Error('Validation error occurred while saving conversation details.');
      }
      // Handle other types of errors.
      console.error('Error saving conversation:', error);
      throw new Error('An error occurred while saving conversation details.');
    }
  }
}

// Export an instance of the Chatbot class.
module.exports = new Chatbot();
