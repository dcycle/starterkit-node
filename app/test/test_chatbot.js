// // test/chatbot.test.js
const test = require('ava');
const sinon = require('sinon');
const Chatbot = require('/mycode/chatbot/index.js'); // Adjust the path accordingly

// Mock the dependencies
const mockMongoose = {
  Schema: sinon.stub(),
  model: sinon.stub().returns({}) // Return a mock model
};

const mockApp = {
  component: sinon.stub(),
  config: sinon.stub().returns({
    modules: {
      './chatbot/index.js': {
        plugins: {
          'examplePlugin': {
            plugin: 'examplePlugin'
          }
        }
      }
    }
  }),
  c: sinon.stub().returns({
    client: sinon.stub().returns({
      db: sinon.stub().returns({
        collection: sinon.stub()
      })
    })
  })
};

// Ensure the mongoose function is mocked correctly
mockApp.component.withArgs('./database/index.js').returns({
  mongoose: sinon.stub().returns(mockMongoose)
});

// Mock the chatbot conversation model
const mockChatbotModel = {
  find: sinon.stub(),
  sort: sinon.stub().returnsThis(), // Allow chaining
  limit: sinon.stub().returnsThis(), // Allow chaining
  save: sinon.stub().returns(Promise.resolve()), // Mock save method
};

// Mock the allChatBotConversations method to return the mock model
Chatbot.allChatBotConversations = sinon.stub().returns(mockChatbotModel);

test.before(async t => {
  // Initialize the chatbot
  await Chatbot.init(mockApp);
});

test('should initialize chatbot and define schema', t => {
  t.truthy(Chatbot.chatbotconversation);
  t.is(mockMongoose.model.callCount, 1);
  t.is(mockMongoose.model.firstCall.args[0], 'ChatbotConversations');
});

test('should handle chat prompt with valid plugin', async t => {
  const mockResult = { success: true };
  const mockPlugin = {
    getResult: sinon.stub().returns(mockResult)
  };
  
  mockApp.c.withArgs('examplePlugin').returns(mockPlugin);
  
  const prompt = {
    plugin: 'examplePlugin',
    text: 'Hello!',
    conversationId: '12345'
  };
  
  const response = await Chatbot.chat(prompt);
  
  t.deepEqual(response, {
    result: mockResult,
    conversationId: '12345'
  });
  t.is(mockPlugin.getResult.callCount, 1);
});

test('should return error if plugin does not exist', async t => {
  const prompt = {
    plugin: 'nonExistentPlugin',
    text: 'Hello!',
    conversationId: '12345'
  };
  
  const response = await Chatbot.chat(prompt);
  
  t.deepEqual(response, { errors: ['Plugin nonExistentPlugin does not exist'] });
});

test('should return error if no plugin or conversationId is provided', async t => {
  const prompt = {
    text: 'Hello!'
  };
  
  const response = await Chatbot.chat(prompt);
  
  t.deepEqual(response, { errors: ['Specify either a plugin or a conversationId'] });
});

test('should fetch previous conversation', async t => {
  // Mock the behavior of find to return an object with chaining
  mockChatbotModel.find.returns(mockChatbotModel); // Allow chaining from find
  mockChatbotModel.sort.returns(mockChatbotModel); // Allow chaining from sort
  mockChatbotModel.limit.returns(Promise.resolve([{ plugin: 'examplePlugin', result: 'previous result' }])); // Return promise for limit

  const previousConvo = await Chatbot.getPreviousConversation('12345');
  
  t.deepEqual(previousConvo, [{ plugin: 'examplePlugin', result: 'previous result' }]);
  t.true(mockChatbotModel.find.calledWith({ conversationId: '12345' }));
});
