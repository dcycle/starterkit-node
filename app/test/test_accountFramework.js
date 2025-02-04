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
  // Stub the global method only once before all tests
  sinon.stub(my, 'getAccountFrameworkModel').returns({
    findOne: sinon.stub().resolves() // default mock for findOne, to be updated in each test
  });
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

  // Mock createNewAccountFramework to return a new account with only the other user
  const createNewAccountFrameworkStub = sinon.stub(my, 'createNewAccountFramework').resolves({
    _id: new MockObjectId('679e4bd779cea8c463197127'),
    userIds: [mockId2]  // After unmerging, only this user should be left
  });

  // Call the function
  const result = await my.unmerge(userInfoId);

  // Assertions
  t.true(result.status);
  t.is(result.message, 'Removed userInfoId from the account framework and created a new account framework with only this user.');

  // Check that account.save was called once
  t.true(account.save.calledOnce);

  // Check that createNewAccountFramework was called with the correct userIds (only the other user remaining)
  t.true(createNewAccountFrameworkStub.calledOnceWith([userInfoId]));
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

test('merge should create a new account framework when neither account exists', async t => {
  const userInfoId1 = "user1";
  const userInfoId2 = "user2";

  // Mock the return value of findOne to return null for both accounts
  sinon.stub(my, 'getAccountFrameworkModel').returns({
    findOne: sinon.stub().resolves(null) // Both accounts don't exist
  });

  // Mock the createNewAccountFramework method
  const createNewAccountFrameworkStub = sinon.stub(my, 'createNewAccountFramework').resolves({
    _id: new MockObjectId('newAccountId'),
    userIds: [userInfoId1, userInfoId2]
  });

  // Call the merge function
  const result = await my.merge(userInfoId1, userInfoId2);

  // Assertions
  t.true(result.status);
  t.is(result.message, 'Both accounts are not in account frameworks, created a new merged account framework.');
  t.true(createNewAccountFrameworkStub.calledOnceWith([userInfoId1, userInfoId2]));
});

test('merge should add userInfoId2 to account1 when account1 exists and account2 does not', async t => {
  const userInfoId1 = "user1";
  const userInfoId2 = "user2";

  // Mock account1 exists but account2 does not
  const account1 = {
    _id: new MockObjectId('account1'),
    userIds: [userInfoId1],
    save: sinon.stub().resolves()
  };

  sinon.stub(my, 'getAccountFrameworkModel').returns({
    findOne: sinon.stub()
      .onFirstCall().resolves(account1) // account1 exists
      .onSecondCall().resolves(null)    // account2 doesn't exist
  });

  // Call the merge function
  const result = await my.merge(userInfoId1, userInfoId2);

  // Assertions
  t.true(result.status);
  t.is(result.message, "Account1 exists in an account framework, added userInfoId2 to account1's framework.");
  t.true(account1.save.calledOnce);  // Ensure account1.save was called
  t.true(account1.userIds.includes(userInfoId2)); // Ensure userInfoId2 was added to account1
});

test('merge should add userInfoId1 to account2 when account2 exists and account1 does not', async t => {
  const userInfoId1 = "user1";
  const userInfoId2 = "user2";

  // Mock account2 exists but account1 does not
  const account2 = {
    _id: new MockObjectId('account2'),
    userIds: [userInfoId2],
    save: sinon.stub().resolves()
  };

  sinon.stub(my, 'getAccountFrameworkModel').returns({
    findOne: sinon.stub()
      .onFirstCall().resolves(null)    // account1 doesn't exist
      .onSecondCall().resolves(account2) // account2 exists
  });

  // Call the merge function
  const result = await my.merge(userInfoId1, userInfoId2);

  // Assertions
  t.true(result.status);
  t.is(result.message, "Account2 exists in an account framework, added userInfoId1 to account2's framework.");
  t.true(account2.save.calledOnce);  // Ensure account2.save was called
  t.true(account2.userIds.includes(userInfoId1)); // Ensure userInfoId1 was added to account2
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

  // Mock both accounts existing separately
  sinon.stub(my, 'getAccountFrameworkModel').returns({
    findOne: sinon.stub()
      .onFirstCall().resolves(account1)  // account1 exists
      .onSecondCall().resolves(account2) // account2 exists
  });

  // Mock the mergeAccountFrameworks method
  const mergeAccountFrameworksStub = sinon.stub(my, 'mergeAccountFrameworks').resolves();

  // Call the merge function
  const result = await my.merge(userInfoId1, userInfoId2);

  // Assertions
  t.true(result.status);
  t.is(result.message, 'Both accounts are already in account frameworks, merged them and deleted the later one.');
  t.true(mergeAccountFrameworksStub.calledOnceWith(account1, account2)); // Ensure mergeAccountFrameworks was called
});

test('merge should not do anything if both accounts are in the same framework', async t => {
  const userInfoId1 = "user1";
  const userInfoId2 = "user2";

  const account = {
    _id: new MockObjectId('sameAccount'),
    userIds: [userInfoId1, userInfoId2]
  };

  // Mock both accounts being in the same framework
  sinon.stub(my, 'getAccountFrameworkModel').returns({
    findOne: sinon.stub()
      .onFirstCall().resolves(account)  // account1 exists
      .onSecondCall().resolves(account) // account2 exists in the same framework
  });

  // Call the merge function
  const result = await my.merge(userInfoId1, userInfoId2);

  // Assertions
  t.true(result.status);
  t.is(result.message, `${userInfoId1}, ${userInfoId2} are in the same account framework.`);
});
