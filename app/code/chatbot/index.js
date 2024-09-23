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
   * @returns {Object} The chatbot conversation model.
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

    // Process the chat based on the plugin type.
    return this.processChatByPlugin(plugin, text.trim(), previousResult, conversationId);
  }

  /**
   * Get the previous conversation based on conversationId.
   * @param {String} conversationId The ID of the conversation to retrieve.
   * @returns The previous conversation entries.
   */
  async getPreviousConversation(conversationId) {
    if (conversationId) {
      return await this.allChatBotConversations().find({ 'conversationId': conversationId }).sort({ createdAt: -1 }).limit(1);
    }
    return [];
  }

  /**
   * Process the chat based on the specified plugin.
   * @param {String} plugin The plugin to use for processing.
   * @param {String} text The input text for the chat.
   * @param {String|Number} previousResult The result from the previous conversation, if available.
   * @param {String} conversationId The previous conversation ids.
   * @returns The response object with the result or error message.
   */
  async processChatByPlugin(plugin, text, previousResult, conversationId) {
    // Check if the specified plugin exists.
    if (plugin === 'calculator') {
      return await this.handleCalculatorPlugin(text, previousResult, conversationId);
    } else {
      // Return error if plugin is not found.      
      return { errors: [`Plugin ${plugin} does not exist`] };
    }
  }

  /**
   * Handle the calculator plugin's chat processing.
   * @param {String} text The input text for the calculator.
   * @param {String|Number} previousResult The result from the previous calculation.
   * @param {String} conversationId The previous conversation ids.
   * @returns The response object with the calculation result.
   */
  async handleCalculatorPlugin(text, previousResult, conversationId) {
    try {
      const result = await this._app.c('chatbotCalculator').calculate(text, previousResult);
      // Import UUID for generating unique conversation IDs.
      // @ts-ignore
      const { v4: uuidv4 } = require('uuid');

      const response = {
        result,
        // Generate a new conversation ID.        
        conversationId: conversationId || uuidv4(),
      };

      if (result !== 'Invalid expression') {
        // Save the conversation to the database.
        await this.storeConversation({
          plugin: 'calculator',
          conversationId: response.conversationId,
          userInput: text,
          result: response.result,
        });
      }
      // Return the successful response.
      return response;

    } catch (error) {
      // Return error message if calculation fails.
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
