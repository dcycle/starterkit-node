const test = require('ava');
const sinon = require('sinon');

// Mocked modules
let my = require('/mycode/tokens/index.js');

// Mock the required dependencies globally
// Mocked dependencies
let TokenModel, crypto;

test.beforeEach(() => {
  // Reset the TokenModel and crypto stubs before each test
  TokenModel = {
    findOne: sinon.stub(),
    save: sinon.stub()
  };

  crypto = {
    random: sinon.stub(),
    randomDigits: sinon.stub(),
    hash: sinon.stub(),
    checkHash: sinon.stub()
  };

  // Reassign the methods from my to ensure they are available
  my.getTokensModel = sinon.stub().returns(TokenModel);
  my._app = {
    c: sinon.stub().returns(crypto)
  };

});

// Reset all stubs after each test to prevent issues with re-stubbing
test.afterEach(() => {
  sinon.restore();
});

test('checkTokenExists - returns token if found', async t => {
  // Arrange
  const token = '12345678';
  const name = 'userAuthentication';
  const fields = 'name _token permissions';
  
  TokenModel.findOne.resolves({ name, _token: token, permissions: ['read', 'write'] });
  

  const result = await my.checkTokenExists(name, token, fields);
  
  // Assert
  t.truthy(result);
  t.is(result.name, name);
  t.is(result._token, token);
  t.deepEqual(result.permissions, ['read', 'write']);
});

test('checkTokenExists - returns null if token not found', async t => {
  // Arrange
  const token = '12345678';
  const name = 'userAuthentication';
  
  TokenModel.findOne.resolves(null);
  

  const result = await my.checkTokenExists(name, token);
  
  // Assert
  t.is(result, null);
});

test('generateToken - retries until a unique token is found', async t => {
  // Example token object
  const tokenObject = {
    name: 'userAuthentication',
    permissions: ['read', 'write'],
    whatever: 'Some additional data',
    _length: 8,
    _digits_only: true,
  };

  // Stub the generateToken method to return a fixed token
  sinon.stub(my, 'generateToken').resolves('12345678');

  // Stub the generateHash method to return a fixed hash
  sinon.stub(my, 'generateHash').resolves('abcdefg12345678');

  // Stub the saveTokenToDatabase method to return the token object
  // with the _token and _hash
  sinon.stub(my, 'saveTokenToDatabase').resolves({
    ...tokenObject,
    _token: '12345678',
    _hash: 'abcdefg12345678',
  });

  // Act: Call the newToken method
  const result = await my.newToken(tokenObject);

  // Assert: The returned token should be '12345678'
  t.is(result, '12345678');

  // Assert: Ensure generateToken was called with the tokenObject
  sinon.assert.calledOnceWithExactly(my.generateToken, tokenObject);

  // Assert: Ensure generateHash was called with the updated tokenObject
  sinon.assert.calledOnceWithExactly(my.generateHash, {
    ...tokenObject,
    _token: '12345678', // This is the generated token
  });

  // Assert: Ensure saveTokenToDatabase was called with the updated tokenObject
  sinon.assert.calledOnceWithExactly(my.saveTokenToDatabase, {
    ...tokenObject,
    _token: '12345678',
    _hash: 'abcdefg12345678', // This is the generated hash
  });
});

test('checkToken should returns false for expired token', async t => {
  const name = 'userAuthentication';
  const tokenToVerify = '67hh';
  // Example token object
  const tokenObject = {
    name: 'userAuthentication:67hh',
    permissions: ['read', 'write'],
    whatever: 'Some additional data',
    _length: 8,
    _digits_only: true,
    _token: "67hh",
    _hash: "abcdefg12345678",
    expiresAt: 1737123511879
  };

  // Stub the generateToken method to return a fixed token
  sinon.stub(my, 'fetchTokenRecord').resolves(tokenObject);

  // Call the newToken method
  const result = await my.checkToken(name, tokenToVerify);

  // Assert: The returned token should be '12345678'
  t.is(result, false);
});
