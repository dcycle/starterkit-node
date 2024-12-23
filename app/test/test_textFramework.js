// test/textFramework.test.js
// Import dependencies for testing
const test = require('ava');
const sinon = require('sinon');
// Adjust the path to your class
const TextFramework = require('/mycode/textFramework/index.js');

let textFramework;
let appMock;

test.beforeEach(() => {
  // Create a new instance of the TextFramework and mock app
  appMock = {
    config: sinon.stub(),
    c: sinon.stub()
  };

  textFramework = new TextFramework();
  textFramework._app = appMock;
});

test('sendText with sms plugin and valid parameters', async t => {
  const mockConfig = {
    modules: {
      './textFramework/index.js': {
        plugins: {
          sms: { plugin: sinon.stub().returns(Promise.resolve()) }
        }
      }
    }
  };

  appMock.config.returns(mockConfig);
  appMock.c.returns({ sendText: sinon.stub().resolves() });

  const result = await textFramework.sendText({
    plugin: 'sms',
    message: 'hello',
    sendTo: '+15555555555'
  });

  t.deepEqual(result, { success: ['Message sent from sms plugin textFramework'] });
});

test('sendText with whatsapp plugin and valid parameters', async t => {
  const mockConfig = {
    modules: {
      './textFramework/index.js': {
        plugins: {
          whatsapp: { plugin: sinon.stub().returns(Promise.resolve()) }
        }
      }
    }
  };

  appMock.config.returns(mockConfig);
  appMock.c.returns({ sendText: sinon.stub().resolves() });

  const result = await textFramework.sendText({
    plugin: 'whatsapp',
    message: 'hello',
    sendTo: '+15555555555'
  });

  t.deepEqual(result, { success: ['Message sent from whatsapp plugin textFramework'] });
});

test('sendText with internal plugin and valid parameters', async t => {
  const mockConfig = {
    modules: {
      './textFramework/index.js': {
        plugins: {
          internal: { plugin: sinon.stub().returns(Promise.resolve()) }
        }
      }
    }
  };

  appMock.config.returns(mockConfig);
  appMock.c.returns({ sendText: sinon.stub().resolves() });

  const result = await textFramework.sendText({
    plugin: 'internal',
    message: 'hello',
    name: 'my name'
  });

  t.deepEqual(result, { success: ['Message sent from internal plugin textFramework'] });
});

// Negative Test Cases

test('sendText with an empty object', async t => {
  const result = await textFramework.sendText({});
  t.deepEqual(result, { errors: ['Kindly specify plugin to send a message'] });
});

test('sendText with sms plugin and missing parameters', async t => {
  const result = await textFramework.sendText({ plugin: 'sms' });
  t.deepEqual(result, { errors: ["Missing 'sendTo' parameter for sms plugin", "Missing 'message' parameter for sms plugin"] });
});

test('sendText with whatsapp plugin and missing parameters', async t => {
  const result = await textFramework.sendText({ plugin: 'whatsapp' });
  t.deepEqual(result, { errors: ["Missing 'sendTo' parameter for whatsapp plugin", "Missing 'message' parameter for whatsapp plugin"] });
});

test('sendText with internal plugin and missing parameters', async t => {
  const result = await textFramework.sendText({ plugin: 'internal' });
  t.deepEqual(result, { errors: ["Missing 'name' parameter for internal plugin", "Missing 'message' parameter for internal plugin"] });
});

test('sendText with sms plugin and missing sendTo', async t => {
  const result = await textFramework.sendText({
    plugin: 'sms',
    message: 'hello'
  });
  t.deepEqual(result, { errors: ["Missing 'sendTo' parameter for sms plugin"] });
});

test('sendText with whatsapp plugin and missing sendTo', async t => {
  const result = await textFramework.sendText({
    plugin: 'whatsapp',
    message: 'hello'
  });
  t.deepEqual(result, { errors: ["Missing 'sendTo' parameter for whatsapp plugin"] });
});

test('sendText with internal plugin and missing name', async t => {
  const result = await textFramework.sendText({
    plugin: 'internal',
    message: 'hello'
  });
  t.deepEqual(result, { errors: ["Missing 'name' parameter for internal plugin"] });
});

test('sendText with sms plugin and empty message', async t => {
  const result = await textFramework.sendText({
    plugin: 'sms',
    message: '',
    sendTo: '+15555555555'
  });
  t.deepEqual(result, { errors: ["Missing 'message' parameter for sms plugin"] });
});

test('sendText with whatsapp plugin and empty message', async t => {
  const result = await textFramework.sendText({
    plugin: 'whatsapp',
    message: '',
    sendTo: '+15555555555'
  });
  t.deepEqual(result, { errors: ["Missing 'message' parameter for whatsapp plugin"] });
});

test('sendText with internal plugin and empty message', async t => {
  const result = await textFramework.sendText({
    plugin: 'internal',
    message: '',
    name: 'my name'
  });
  t.deepEqual(result, { errors: ["Missing 'message' parameter for internal plugin"] });
});

test('sendText with sms plugin and empty sendTo', async t => {
  const result = await textFramework.sendText({
    plugin: 'sms',
    message: 'hello',
    sendTo: ''
  });
  t.deepEqual(result, { errors: ["Missing 'sendTo' parameter for sms plugin"] });
});

test('sendText with whatsapp plugin and empty sendTo', async t => {
  const result = await textFramework.sendText({
    plugin: 'whatsapp',
    message: 'hello',
    sendTo: ''
  });
  t.deepEqual(result, { errors: ["Missing 'sendTo' parameter for whatsapp plugin"] });
});

test('sendText with internal plugin and empty name', async t => {
  const result = await textFramework.sendText({
    plugin: 'internal',
    message: 'hello',
    name: ''
  });
  t.deepEqual(result, { errors: ["Missing 'name' parameter for internal plugin"] });
});

test('sendText should validate plugin, parameters, and send message successfully', async t => {
  // Mock the app config to return a valid plugin setup
  const mockConfig = {
    modules: {
      './textFramework/index.js': {
        plugins: {
          whatsapp: { plugin: sinon.stub().returns(Promise.resolve()) }
        }
      }
    }
  };

  appMock.config.returns(mockConfig);
  appMock.c.returns({ sendText: sinon.stub().resolves() });

  // Test input data
  const data = {
    plugin: 'whatsapp',
    message: 'Hello!',
    sendTo: '+1234567890'
  };

  const result = await textFramework.sendText(data);

  // Assert that sendText was successful
  t.deepEqual(result, { success: ['Message sent from whatsapp plugin textFramework'] });

  // Ensure validation methods are called
  t.true(appMock.config.calledOnce);
  t.true(appMock.c.calledOnce);
});

test('sendText should return error if plugin is not enabled', async t => {
  // Mock app config with a missing plugin
  const mockConfig = {
    modules: {
      './textFramework/index.js': {
        plugins: {}
      }
    }
  };

  appMock.config.returns(mockConfig);

  const data = {
    plugin: 'whatsapp',
    message: 'Hello!',
    sendTo: '+1234567890'
  };

  const result = await textFramework.sendText(data);

  // Assert the error message for missing plugin
  t.deepEqual(result, { errors: ['Plugin whatsapp is not enabled in textFramework'] });
});

test('sendText should return error if required parameters are missing', async t => {
  // Mock the app config to return a valid plugin setup
  const mockConfig = {
    modules: {
      './textFramework/index.js': {
        plugins: {
          whatsapp: { plugin: sinon.stub().returns(Promise.resolve()) }
        }
      }
    }
  };

  appMock.config.returns(mockConfig);

  // Missing 'sendTo' parameter
  const data = {
    plugin: 'whatsapp',
    message: 'Hello!'
  };

  const result = await textFramework.sendText(data);

  // Assert the error message for missing parameters
  t.deepEqual(result, { errors: ["Missing 'sendTo' parameter for whatsapp plugin"] });
});

test('validatePlugin should return an error for missing plugin', t => {
  const result = textFramework.validatePlugin();
  t.deepEqual(result, { errors: ['Kindly specify plugin to send a message'] });
});

test('validatePlugin should return an error for disabled plugin', t => {
  // Mock the app config to return a disabled plugin
  const mockConfig = {
    modules: {
      './textFramework/index.js': {
        plugins: {}
      }
    }
  };

  appMock.config.returns(mockConfig);

  const result = textFramework.validatePlugin('whatsapp');
  t.deepEqual(result, { errors: ['Plugin whatsapp is not enabled in textFramework'] });
});

test('validatePlugin should pass for enabled plugin', t => {
  const mockConfig = {
    modules: {
      './textFramework/index.js': {
        plugins: {
          whatsapp: {}
        }
      }
    }
  };

  appMock.config.returns(mockConfig);

  const result = textFramework.validatePlugin('whatsapp');
  t.deepEqual(result, {});
});

test('validateParameters should return an error for missing parameter', t => {
  const data = {
    plugin: 'whatsapp',
    message: 'Hello!'
  };

  const result = textFramework.validateParameters('whatsapp', data);
  t.deepEqual(result, { errors: ["Missing 'sendTo' parameter for whatsapp plugin"] });
});

test('validateParameters should pass with correct parameters', t => {
  const data = {
    plugin: 'whatsapp',
    message: 'Hello!',
    sendTo: '+1234567890'
  };

  const result = textFramework.validateParameters('whatsapp', data);
  t.deepEqual(result, {});
});

test('getPluginHandler should return handler function if plugin is available', t => {
  // Mock the app config to return a plugin handler
  const mockConfig = {
    modules: {
      './textFramework/index.js': {
        plugins: {
          whatsapp: { plugin: () => 'whatsapp handler' }
        }
      }
    }
  };

  appMock.config.returns(mockConfig);

  const handler = textFramework.getPluginHandler('whatsapp');
  t.is(handler, 'whatsapp handler');
});

test('getPluginHandler should return null if plugin is not available', t => {
  // Mock the app config with no handler for 'whatsapp'
  const mockConfig = {
    modules: {
      './textFramework/index.js': {
        plugins: {}
      }
    }
  };

  appMock.config.returns(mockConfig);

  const handler = textFramework.getPluginHandler('whatsapp');
  t.is(handler, null);
});

test('sendMessage should send the message and return success', async t => {
  // Mock sendText to resolve successfully
  appMock.c.returns({ sendText: sinon.stub().resolves() });

  const data = { plugin: 'whatsapp', message: 'Test message', sendTo: '+1234567890' };

  const result = await textFramework.sendMessage('whatsappHandler', data);

  t.deepEqual(result, { success: ['Message sent from whatsapp plugin textFramework'] });
});

test('sendMessage should return error if sending fails', async t => {
  // Mock sendText to reject with an error
  appMock.c.returns({ sendText: sinon.stub().rejects(new Error('Failed to send message')) });

  const data = { plugin: 'whatsapp', message: 'Test message', sendTo: '+1234567890' };

  const result = await textFramework.sendMessage('whatsappHandler', data);

  t.deepEqual(result, { errors: ['Error sending message using whatsapp: Failed to send message'] });
});