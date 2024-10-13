const test = require('ava');
const sinon = require('sinon');

let my = require('/mycode/loginWithGoogle/index.js');

let appStub;

test.beforeEach(t => {  
  // Create a stub for the app method and its c method
  appStub = sinon.stub().returns({
      c: sinon.stub().returns({
          uniqueFieldToUsername: sinon.stub()
      })
  });
  my.app = appStub;
});

test('profileToDisplayName should return username when displayName is valid', async t => {
  const profile = { displayName: "abcd efg" };
  const expectedUsername = 'abcd efg';

  // Mocking uniqueFieldToUsername to return the expected username
  appStub().c().uniqueFieldToUsername.returns(expectedUsername);

  const result = await my.profileToDisplayName(profile);

  t.is(result, expectedUsername);
  t.true(appStub().c().uniqueFieldToUsername.calledOnce);
  t.true(appStub().c().uniqueFieldToUsername.calledWith(
    'google_display_name', 'abcd efg', 'abcd efg'
  ));
});

test('profileToGoogleDisplayName should throw an error if profile.displayName is missing', t => {
  const profile = {};

  const error = t.throws(() => {
    my.profileToGoogleDisplayName(profile);
  }, { instanceOf: Error });

  t.is(error.message, 'Cannot extract displayName from profile: No displayName found.');
});


test('profileToGoogleDisplayName; should throw an error if displayName is empty', t => {
  const profile = { displayName: "" };

  const error = t.throws(() => {
    my.profileToGoogleDisplayName(profile);
  });

  t.is(error.message, 'displayName cannot be empty.');
});