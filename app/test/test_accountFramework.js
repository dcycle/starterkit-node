const test = require('ava');
const sinon = require('sinon');

// Mocked modules
let my = require('/mycode/accountFramework/index.js');

// Mock ObjectId
class MockObjectId {
  constructor(id) {
    this.id = id;
  }

  equals(otherId) {
    return this.id === otherId.id;
  }

  toString() {
    return this.id;
  }
}

// Setup global stubbing before tests and cleanup after all tests
test.before(() => {

  // Mock app() and component() globally
  const mockApp = {
    component: sinon.stub().returns({
      mongoose: sinon.stub().returns({
        Types: {
          ObjectId: sinon.stub().returns({})
        }
      })
    }),
    c: sinon.stub().returns({
      // userDetails should be a function
      userDetails: sinon.stub().returns({
        // Stub find() as a method
        find: sinon.stub()
      }),
      newToken: sinon.stub()
    }),
    config: sinon.stub().returns({
      modules: {
        './accountFramework/index.js': sinon.stub()
      }
    }),
  };

  sinon.stub(my, 'app').returns(mockApp);

  // Stub the global method only once before all tests
  sinon.stub(my, 'getAccountFrameworkModel').returns({
     // default mock for findOne, to be updated in each test
    findOne: sinon.stub().resolves(),
    findByIdAndDelete: sinon.stub().resolves()
  });

  // Stub createNewAccountFramework globally
  sinon.stub(my, 'createNewAccountFramework').returns(Promise.resolve({
    _id: new MockObjectId('newAccountId'), 
    userIds: [],  // Default empty userIds, to be updated in each test
    save: sinon.stub().resolves()  // Mock save method to simulate saving the account
  }));

  // Global stubbing for dependencies in the `getAccounts` method
  sinon.stub(my, 'validateObjectId').resolves();  // Stub validateObjectId to resolve without error
  sinon.stub(my, 'findAccountByUserId').resolves(); // Stub findAccountByUserId, to be overridden in tests

});

test.after(() => {
  // Restore all stubs after all tests to ensure clean environment
  sinon.restore();

});

test('unmerge should remove user from account framework and create a new one', async t => {
  // This should match one of the ObjectIds in userIds
  const userInfoId = "679cab8c2c8c9642d2d862b1";

  // Create mock ObjectIds using the MockObjectId class
  const mockId1 = new MockObjectId("679cab8c2c8c9642d2d862b1");
  const mockId2 = new MockObjectId("679ce2347d8a5b31b1df6a77");

  // Initial account setup
  const account = { 
    _id: new MockObjectId('679e4bd779cea8c463197127'), 
    userIds: [mockId1, mockId2],  // Use mocked ObjectIds
    save: sinon.stub().resolves() // Mocking save
  };

  // Mock the return value of `findOne` for this test
  my.getAccountFrameworkModel().findOne.resolves(account);

  // Mock createNewAccountFramework to return a new account with only the userInfoId
  my.createNewAccountFramework.resolves({
    _id: new MockObjectId('newAccountId'),
    userIds: [userInfoId],  // New account with only this user
    save: sinon.stub().resolves() // Mock save method
  });

  // Call the function
  const result = await my.unmerge(userInfoId);

  // Assertions
  t.true(result.status);
  t.is(result.message, 'Removed ' + userInfoId + ' from the account framework and created a new account framework with only this user.');

  // Check that account.save was called once
  t.true(account.save.calledOnce);

});


test("unmerge shouldn't remove user from account framework and create a new one", async t => {
  // This should match one of the ObjectIds in userIds
  const userInfoId = "679cab8c2c8c9642d2d862b1";

  // Create mock ObjectIds using the MockObjectId class
  const mockId1 = new MockObjectId("679cab8c2c8c9642d2d862b1");

  // Initial account setup
  const account = { 
    _id: new MockObjectId('679e4bd779cea8c463197127'), 
    userIds: [mockId1],  // Use mocked ObjectIds
    save: sinon.stub().resolves() // Mocking save
  };

  // Mock the return value of `findOne` for this test
  my.getAccountFrameworkModel().findOne.resolves(account);

  // Call the function
  const result = await my.unmerge(userInfoId);

  // Assertions
  t.false(result.status);
  t.is(result.message, "account framework doc don't have multiple userIds");
});

test("unmerge should return error if account not found", async t => {
  // This should match one of the ObjectIds in userIds
  const userInfoId = "679cab8c2c8c9642d2d862b1";

  // Mock the return value of `findOne` for this test
  my.getAccountFrameworkModel().findOne.resolves(null);

  // Call the function
  const result = await my.unmerge(userInfoId);

  // Assertions
  t.false(result.status);
  t.is(result.message, `Account Framework not found for userIds ${userInfoId}`);
});

test.serial('merge should create a new account framework when neither account exists', async t => {
  const userInfoId1 = "679cab8c2c8c9642d2d862b1";
  const userInfoId2 = "679cab8c2c8c9642d2d86277";
  const mockId1 = new MockObjectId(userInfoId1);
  const mockId2 = new MockObjectId(userInfoId2);

  // Resetting the findOne stub if it exists
  if (my.getAccountFrameworkModel().findOne.reset) {
    my.getAccountFrameworkModel().findOne.reset();
  }

  // Mock that account1 exists and account2 does not
  my.getAccountFrameworkModel().findOne
    .onFirstCall().resolves(null)  // account1 exists
    .onSecondCall().resolves(null);    // account2 does not exist

  // Mock createNewAccountFramework to return a new account with both users
  const newAccount = {
    _id: new MockObjectId('newAccountId'),
    userIds: [mockId1, mockId2],
    save: sinon.stub().resolves()
  };

  my.createNewAccountFramework.resolves(newAccount);
  // Call the merge function
  const result = await my.merge(userInfoId1, userInfoId2);

  // Assertions
  t.is(result.message, 'Both accounts are not in account frameworks, created a new merged account framework.');
  my.getAccountFrameworkModel().findOne.reset();
  my.createNewAccountFramework.resetHistory();

});

test.serial('merge should add userInfoId2 to account1 when account1 exists and account2 does not', async t => {
  const userInfoId1 = "user1";
  const userInfoId2 = "user2";

  // Mock account1 exists but account2 does not
  const account1 = {
    _id: new MockObjectId('account1'),
    userIds: [userInfoId1],
    save: sinon.stub().resolves([userInfoId1, userInfoId2])
  };

  // Resetting the findOne stub if it exists
  if (my.getAccountFrameworkModel().findOne.reset) {
    my.getAccountFrameworkModel().findOne.reset();
  }

  // Mock that account1 exists and account2 does not
  my.getAccountFrameworkModel().findOne
    .onFirstCall().resolves(account1)  // account1 exists
    .onSecondCall().resolves(null);    // account2 does not exist

  // Call the merge function
  const result = await my.merge(userInfoId1, userInfoId2);

  // Assertions
  t.true(result.status);
  t.is(result.message, "Account1 exists in an account framework, added userInfoId2 to account1's framework.");
  t.true(account1.userIds.includes(userInfoId2)); // Ensure userInfoId2 was added to account1
});

test.serial('merge should add userInfoId1 to account2 when account2 exists and account1 does not', async t => {
  const userInfoId1 = "user1";
  const userInfoId2 = "user2";

  // Mock account2 exists but account1 does not
  const account2 = {
    _id: new MockObjectId('account2'),
    userIds: [userInfoId2],
    save: sinon.stub().resolves([userInfoId1, userInfoId2])
  };

  // Resetting the findOne stub if it exists
  if (my.getAccountFrameworkModel().findOne.reset) {
    my.getAccountFrameworkModel().findOne.reset();
  }

  // Mock that account1 exists and account2 does not
  my.getAccountFrameworkModel().findOne
    .onFirstCall().resolves(null)  // account1 exists
    .onSecondCall().resolves(account2);    // account2 does not exist

  // Call the merge function
  const result = await my.merge(userInfoId1, userInfoId2);

  // Assertions
  t.true(result.status);
  t.is(result.message, "Account2 exists in an account framework, added userInfoId1 to account2's framework.");
  t.true(account2.save.calledOnce);  // Ensure account1.save was called once
  t.true(account2.userIds.includes(userInfoId2)); // Ensure userInfoId2 was added to account1
});

test('merge should merge two separate accounts when both accounts exist in separate frameworks', async t => {
  const userInfoId1 = "user1";
  const userInfoId2 = "user2";

  const account1 = {
    _id: new MockObjectId('account1'),
    userIds: [userInfoId1],
    save: sinon.stub().resolves()
  };

  const account2 = {
    _id: new MockObjectId('account2'),
    userIds: [userInfoId2],
    save: sinon.stub().resolves()
  };

  // Resetting the findOne stub if it exists
  if (my.getAccountFrameworkModel().findOne.reset) {
    my.getAccountFrameworkModel().findOne.reset();
  }

  // Mock that account1 exists and account2 does not
  my.getAccountFrameworkModel().findOne
    .onFirstCall().resolves(account1)  // account1 exists
    .onSecondCall().resolves(account2);    // account2 does not exist

  // Mock the mergeAccountFrameworks method
  const mergeAccountFrameworksStub = sinon.stub(my, 'mergeAccountFrameworks').resolves();

  // Call the merge function
  const result = await my.merge(userInfoId1, userInfoId2);

  // Assertions
  t.true(result.status);
  t.is(result.message, 'Both accounts are already in account frameworks, merged them and deleted the later one.');
});

test.serial('merge should not do anything if both accounts are in the same framework', async t => {
  const userInfoId1 = "user1";
  const userInfoId2 = "user2";

  const sharedMockId = new MockObjectId('sameAccount');  // shared ID instance

  const account1 = {
    _id: sharedMockId,
    userIds: [userInfoId1],
    save: sinon.stub().resolves()
  };
  
  const account2 = {
    _id: sharedMockId,
    userIds: [userInfoId1, userInfoId2],
    save: sinon.stub().resolves()
  };

  // Resetting the findOne stub if it exists
  if (my.getAccountFrameworkModel().findOne.reset) {
    my.getAccountFrameworkModel().findOne.reset();
  }

  // Mock that account1 exists and account2 does not
  my.getAccountFrameworkModel().findOne
    .onFirstCall().resolves(account1)  // account1 exists
    .onSecondCall().resolves(account2);    // account2 does not exist

  // Call the merge function
  const result = await my.merge(userInfoId1, userInfoId2);

  // Assertions
  t.true(result.status);
  t.is(result.message, `User ids ${userInfoId1}, ${userInfoId2} are in the same account framework.`);
});

// Test if `getAccounts` correctly validates the ObjectId
test.serial('getAccounts should validate the ObjectId before performing the query', async t => {
  const userInfoId = "679cab8c2c8c9642d2d862b1";

  // Mock the return value of findAccountByUserId
  my.findAccountByUserId.resolves(null);  // Simulate no account found

  // Call the function
  await my.getAccounts(userInfoId);

  // Check if validateObjectId was called with the correct userInfoId
  t.true(my.validateObjectId.calledOnce);
  t.true(my.validateObjectId.calledWith(userInfoId));
});

// Test if `getAccounts` retrieves the correct account when it exists
test.serial('getAccounts should return the userIds when an account is found', async t => {

  const userInfoId1 = "679cab8c2c8c9642d2d862b1";
  const userInfoId2 = "679cab8c2c8c9642d2d86277";

  const mockId1 = new MockObjectId(userInfoId1);
  const mockId2 = new MockObjectId(userInfoId2);

  // Mock the return value of findAccountByUserId to return an account
  my.findAccountByUserId.resolves({userIds: [mockId1, mockId2]});

  // Call the function
  const result = await my.getAccounts(userInfoId1);
  // Assertions
  // Ensure the correct userIds are returned
  t.deepEqual(result, [mockId1, mockId2]);

});

// Test if `getAccounts` returns an empty array when no account is found
test.serial('getAccounts should return an empty array if no account is found', async t => {
  const userInfoId = "679cab8c2c8c9642d2d862b1";

  // Mock the return value of findAccountByUserId to return null (no account found)
  my.findAccountByUserId.resolves(null);
  // Stub the find method to return null in this specific test
  my.app().c('authentication').userDetails().find.resolves(null);

  // Call the function
  const result = await my.getAccounts(userInfoId);

  // Assertions
  t.deepEqual(result, []);  // Ensure an empty array is returned
});

// Test if `getAccounts` returns an empty array when no account is found
test.serial('getAccounts should return an user details from userInfo if account not found in account framework', async t => {
  const userInfoId = "679cab8c2c8c9642d2d862b1";

  // Mock the return value of findAccountByUserId to return null (no account found)
  my.findAccountByUserId.resolves(null);
  // Stub the find method to return ['user1'] in this specific test
  my.app().c('authentication').userDetails().find.resolves(['user1']);

  // Call the function
  const result = await my.getAccounts(userInfoId);

  // Assertions
  t.deepEqual(result, ['user1']);  // Ensure an empty array is returned
});

test.serial('mergeAccountFrameworks merges userIds and deduplicates correctly', async (t) => {
  const account1 = { 
    _id: 'account1', 
    userIds: ['user1', 'user2'], 
    save: sinon.stub().resolves() 
  };

  const account2 = { 
    _id: 'account2', 
    userIds: ['user2', 'user3'], 
    save: sinon.stub().resolves() 
  };

  await my.mergeAccountFrameworks(account1, account2);

  // Check that userIds are merged and deduplicated correctly
  t.deepEqual(account1.userIds, ['user1', 'user2', 'user3']);
  t.deepEqual(account2.userIds, ['user1', 'user2', 'user3']);

  // Ensure that the save method is called on both accounts
  t.true(account1.save.calledOnce);
  t.true(account2.save.calledOnce);

  // Ensure that the delete operation was called for account2
  const findByIdAndDelete = my.getAccountFrameworkModel().findByIdAndDelete;
  t.true(findByIdAndDelete.calledOnceWith('account2'));
});

test.serial('validateObjectId resolves for valid ObjectId', async (t) => {
  const validObjectId = '507f1f77bcf86cd799439011'; // Valid ObjectId

  try {
    await my.validateObjectId(validObjectId);
    t.pass('No error thrown for valid ObjectId');
  } catch (err) {
    t.fail('Error should not be thrown for valid ObjectId');
  }
});

test.serial('validateObjectId resolves with mocked ObjectId', async (t) => {
  const validObjectId = new MockObjectId('507f1f77bcf86cd799439011');

  // Stub the mongoose ObjectId to behave as valid
  my.app().component().mongoose().Types.ObjectId.returns(validObjectId);

  try {
    await my.validateObjectId(validObjectId.toString());
    t.pass('No error thrown for mocked valid ObjectId');
  } catch (err) {
    t.fail('Error should not be thrown for mocked valid ObjectId');
  }
});

// Valid ObjectId, account is merged
test.serial('accountIsMerged should return true when account is merged', async t => {
  const userInfoId = 'validUserId';
  const mockUserInfoObjectId = new MockObjectId(userInfoId);

  // Mock the findAccountByUserId to return an account with merged status
  const mockAccount = {
    _id: mockUserInfoObjectId,
    userIds: ['validUserId'],
    save: sinon.stub().resolves()
  };

  my.findAccountByUserId.resolves(mockAccount);

  // Call the method and assert the result
  const result = await my.accountIsMerged(userInfoId);

  t.deepEqual(result.userIds, ['validUserId'], 'accountIsMerged should return the merged account');
});

// Invalid ObjectId
test.serial('accountIsMerged should throw an error when ObjectId is invalid', async t => {
  const invalidUserInfoId = 'invalidUserId';

  // Simulate invalid ObjectId
  my.validateObjectId.throws(new Error('Invalid ObjectId'));

  const error = await t.throwsAsync(() => my.accountIsMerged(invalidUserInfoId));
  t.is(error.message, 'Failed to check if the account is merged: Invalid ObjectId', 'Error message should match');
});

// Error in finding account
test.serial('accountIsMerged should throw an error if finding account fails', async t => {
  const userInfoId = 'validUserId';

  // Simulate a failure in the findAccountByUserId method
  my.findAccountByUserId.throws(new Error('Database error'));

  const error = await t.throwsAsync(() => my.accountIsMerged(userInfoId));
  t.is(error.message, 'Failed to check if the account is merged: Invalid ObjectId', 'Error message should match');
});

// Default Token Expiry (when no expiry duration is set)
test.serial('generateToken should generate a token with no expiry if tokenExpiryDuration is 0', async t => {
  // Mock the config to return 0 for tokenExpiryDuration
  my.app().config().modules['./accountFramework/index.js'].returns({
    "tokenExpiryDuration": 0
  });

  const name = 'testName';

  // Call the method and assert the result
  const token = await my.generateToken(name);

  t.true(my.app().c('tokens').newToken.calledOnce, 'newToken method should be called once');
  t.deepEqual(my.app().c('tokens').newToken.firstCall.args[0], {
    name: name,
    permissions: ['some-permission', 'another-permission'],
    whatever: 'Token generated for merge accounts',
    _length: 12,
    _digits_only: false,
  }, 'newToken method should be called with the correct parameters');

  // Check token expiry duration (should be 0 for no expiry)
  t.is(my.app().c('tokens').newToken.firstCall.args[1], 0, 'Token should have no expiry duration');
});

// Error in Token Creation
test.serial('generateToken should throw an error if token generation fails', async t => {
  // Mock the newToken method to throw an error
  my.app().c('tokens').newToken.rejects(new Error('Token generation failed'));

  const name = 'testName';

  const error = await t.throwsAsync(() => my.generateToken(name));
  t.is(error.message, 'Token generation failed', 'The error message should match');
});
