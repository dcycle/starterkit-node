const test = require('ava');
const sinon = require('sinon');
const AccountFramework = require('/mycode/accountFramework/index.js');

// Mock Mongoose Model
const mockModel = {
  findOne: sinon.stub(),
  save: sinon.stub(),
  findByIdAndDelete: sinon.stub(),
};


// Stub getAccountFrameworkModel to return the mock model
sinon.stub(AccountFramework, 'getAccountFrameworkModel').returns(mockModel);

test('should merge two accounts into one framework', async t => {
  // Arrange
  const user1 = '507f1f77bcf86cd799439011';
  const user2 = '507f1f77bcf86cd799439012';

  // Mock the createNewAccountFramework method on the instance
  sinon.stub(AccountFramework, 'createNewAccountFramework').resolves({
    userIds: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
  });

  // Mock findOne to simulate user1 existing in a framework
  mockModel.findOne.resolves({ _id: 'someId', userIds: [user1] });

  const result = await AccountFramework.merge(user1, user2);

  // Assert
  t.is(result.status, true);
  t.is(result.message, 'Both accounts are already in account frameworks, merged them and deleted the later one.');
});

test('should create a new framework when no accounts exist', async t => {
  const user1 = '507f1f77bcf86cd799439011';
  const user2 = '507f1f77bcf86cd799439012';

  // // Mock the createNewAccountFramework method on the instance
  // sinon.stub(AccountFramework, 'createNewAccountFramework').resolves({
  //   userIds: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
  // });

  // Mock findOne to return null (no accounts found)
  mockModel.findOne.resolves(null);

  const result = await AccountFramework.merge(user1, user2);

  // Assert
  t.is(result.status, true);
  t.is(result.message, 'Both accounts are not in account frameworks, created a new merged account framework.');
});

test.afterEach(() => {
  sinon.restore();
});

