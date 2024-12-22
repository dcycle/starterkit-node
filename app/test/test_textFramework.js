// // test/chatbot.test.js
const test = require('ava');
const sinon = require('sinon');

// Assuming the actual sendText function is being tested here
const sendText = require('/mycode/textFramework/index.js');

// Assuming the original sendText method is available and we have access to app.
const app = {
  c: sinon.stub().returns({
    sendText: sinon.stub().resolves({ success: ['Message sent'] })
  }),
};

// Test 1: Test valid 'sms' plugin with all required fields
test('Valid sms plugin with all required fields', async (t) => {
  const data = {
    plugin: 'sms',
    message: 'hello',
    sendTo: '+15555555555'
  };

  const result = await app.c('textFramework').sendText(data);
  t.deepEqual(result, { success: ['Message sent from sms plugin textFramework'] });
  t.true(app.c.calledOnce); // Verify that the sendText was called once
});

// Test 2: Test valid 'whatsapp' plugin with all required fields
test('Valid whatsapp plugin with all required fields', async (t) => {
  const data = {
    plugin: 'whatsapp',
    message: 'hello',
    sendTo: '+15555555555'
  };

  const result = await app.c('textFramework').sendText(data);
  t.deepEqual(result, { success: ['Message sent from whatsapp plugin textFramework'] });
  t.true(app.c.calledOnce);
});

// Test 3: Test valid 'internal' plugin with name field
test('Valid internal plugin with all required fields', async (t) => {
  const data = {
    plugin: 'internal',
    message: 'hello',
    name: 'my name'
  };

  const result = await app.c('textFramework').sendText(data);
  t.deepEqual(result, { success: ['Message sent from internal plugin textFramework'] });
  t.true(app.c.calledOnce);
});

// Test 4: Test with no data
test('No data passed', async (t) => {
  const data = {};
  const result = await app.c('textFramework').sendText(data);
  t.deepEqual(result, { errors: ['Kindly specify plugin to send a message'] });
  t.true(app.c.notCalled);
});

// Test 5: Test 'sms' plugin with missing 'sendTo'
test('Missing sendTo for sms plugin', async (t) => {
  const data = {
    plugin: 'sms',
    message: 'hello'
  };

  const result = await app.c('textFramework').sendText(data);
  t.deepEqual(result, { errors: ["Missing 'sendTo' parameter for sms plugin"] });
  t.true(app.c.notCalled);
});

// Test 6: Test 'whatsapp' plugin with missing 'sendTo'
test('Missing sendTo for whatsapp plugin', async (t) => {
  const data = {
    plugin: 'whatsapp',
    message: 'hello'
  };

  const result = await app.c('textFramework').sendText(data);
  t.deepEqual(result, { errors: ["Missing 'sendTo' parameter for whatsapp plugin"] });
  t.true(app.c.notCalled);
});

// Test 7: Test 'internal' plugin with missing 'name'
test('Missing name for internal plugin', async (t) => {
  const data = {
    plugin: 'internal',
    message: 'hello'
  };

  const result = await app.c('textFramework').sendText(data);
  t.deepEqual(result, { errors: ["Missing 'name' parameter for internal plugin"] });
  t.true(app.c.notCalled);
});

// Test 8: Test 'sms' plugin with empty 'sendTo'
test('Empty sendTo for sms plugin', async (t) => {
  const data = {
    plugin: 'sms',
    message: 'hello',
    sendTo: ''
  };

  const result = await app.c('textFramework').sendText(data);
  t.deepEqual(result, { errors: ["sendTo cannot be empty for sms plugin"] });
  t.true(app.c.notCalled);
});

// Test 9: Test 'whatsapp' plugin with empty 'sendTo'
test('Empty sendTo for whatsapp plugin', async (t) => {
  const data = {
    plugin: 'whatsapp',
    message: 'hello',
    sendTo: ''
  };

  const result = await app.c('textFramework').sendText(data);
  t.deepEqual(result, { errors: ["sendTo cannot be empty for whatsapp plugin"] });
  t.true(app.c.notCalled);
});

// Test 10: Test 'internal' plugin with empty 'name'
test('Empty name for internal plugin', async (t) => {
  const data = {
    plugin: 'internal',
    message: 'hello',
    name: ''
  };

  const result = await app.c('textFramework').sendText(data);
  t.deepEqual(result, { errors: ["name cannot be empty for internal plugin"] });
  t.true(app.c.notCalled);
});

// Test 11: Test 'sms' plugin with empty message
test('Empty message for sms plugin', async (t) => {
  const data = {
    plugin: 'sms',
    message: '',
    sendTo: '+15555555555'
  };

  const result = await app.c('textFramework').sendText(data);
  t.deepEqual(result, { errors: ["Message cannot be empty for sms plugin"] });
  t.true(app.c.notCalled);
});

// Test 12: Test 'whatsapp' plugin with empty message
test('Empty message for whatsapp plugin', async (t) => {
  const data = {
    plugin: 'whatsapp',
    message: '',
    sendTo: '+15555555555'
  };

  const result = await app.c('textFramework').sendText(data);
  t.deepEqual(result, { errors: ["Message cannot be empty for whatsapp plugin"] });
  t.true(app.c.notCalled);
});

// Test 13: Test 'internal' plugin with empty message
test('Empty message for internal plugin', async (t) => {
  const data = {
    plugin: 'internal',
    message: '',
    name: 'my name'
  };

  const result = await app.c('textFramework').sendText(data);
  t.deepEqual(result, { errors: ["Message cannot be empty for internal plugin"] });
  t.true(app.c.notCalled);
});

// Test 14: Test 'sms' plugin with missing message and sendTo
test('Missing message and sendTo for sms plugin', async (t) => {
  const data = {
    plugin: 'sms'
  };

  const result = await app.c('textFramework').sendText(data);
  t.deepEqual(result, { errors: ["Missing 'sendTo' parameter for sms plugin", "Message cannot be empty for sms plugin"] });
  t.true(app.c.notCalled);
});

// Test 15: Test 'whatsapp' plugin with missing message and sendTo
test('Missing message and sendTo for whatsapp plugin', async (t) => {
  const data = {
    plugin: 'whatsapp'
  };

  const result = await app.c('textFramework').sendText(data);
  t.deepEqual(result, { errors: ["Missing 'sendTo' parameter for whatsapp plugin", "Message cannot be empty for whatsapp plugin"] });
  t.true(app.c.notCalled);
});

// Test 16: Test 'internal' plugin with missing message and name
test('Missing message and name for internal plugin', async (t) => {
  const data = {
    plugin: 'internal'
  };

  const result = await app.c('textFramework').sendText(data);
  t.deepEqual(result, { errors: ["Missing 'name' parameter for internal plugin", "Message cannot be empty for internal plugin"] });
  t.true(app.c.notCalled);
});
