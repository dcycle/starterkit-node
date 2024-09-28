// test/chatbot.test.js
const test = require('ava');
const sinon = require('sinon');
const Chatbot = require('/mycode/chatbot/index.js'); // Adjust the path accordingly

// Mock the dependencies
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

const mockMongoose = {
  Schema: sinon.stub(),
  model: sinon.stub()
};

mockApp.component.withArgs('./database/index.js').returns(mockMongoose);

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
  const mockFind = sinon.stub().returns({
    sort: sinon.stub().returns({
      limit: sinon.stub().returns(Promise.resolve([{ plugin: 'examplePlugin', result: 'previous result' }])),
    }),
  });

  Chatbot.allChatBotConversations = () => ({
    find: mockFind
  });

  const previousConvo = await Chatbot.getPreviousConversation('12345');
  
  t.deepEqual(previousConvo, [{ plugin: 'examplePlugin', result: 'previous result' }]);
  t.true(mockFind.calledWith({ conversationId: '12345' }));
});
