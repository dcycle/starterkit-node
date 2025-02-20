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

test('profileToGoogleDisplayName should throw an error if profile.displayName is missing', t => {
  const profile = {};

  const error = t.throws(() => {
    my.profileToGoogleDisplayName(profile);
  }, { instanceOf: Error });

  t.is(error.message, 'Cannot extract displayName from profile: No displayName found.');
});


test('profileToGoogleDisplayName should throw an error if displayName is empty', t => {
  const profile = { displayName: "" };

  const error = t.throws(() => {
    my.profileToGoogleDisplayName(profile);
  });

  t.is(error.message, 'Cannot extract displayName from profile: No displayName found.');
});

test('profileToGoogleEmail should throw an error if email is empty', t => {
  const profile = { emails: [{ value: '' }] };

  const error = t.throws(() => {
    my.profileToGoogleEmail(profile);
  });

  t.is(error.message, 'Email cannot be empty.');
});

test('profileToGoogleEmail should throw an error if email is undefined', t => {
  const profile = { emails: [{}] };

  const error = t.throws(() => {
    my.profileToGoogleEmail(profile);
  });

  t.is(error.message, 'Cannot extract email from profile.');
});

test('profileToGoogleEmail should throw an error if profile.emails is empty', t => {
  const profile = { emails: [] };

  const error = t.throws(() => {
    my.profileToGoogleEmail(profile);
  }, { instanceOf: Error });

  t.is(error.message, 'Cannot extract email from profile: No emails found.');
});

test('profileToGoogleEmail should throw an error if profile.emails is missing', t => {
  const profile = {};

  const error = t.throws(() => {
    my.profileToGoogleEmail(profile);
  }, { instanceOf: Error });

  t.is(error.message, 'Cannot extract email from profile: No emails found.');
});

test('profileToDisplayName should return username when email is valid', async t => {
  const profile = { displayName: "abcd efg", emails: [{ value: 'test@example.com' }] };
  const expectedUsername = 'abcd efg';

  // Mocking uniqueFieldToUsername to return the expected username
  appStub().c().uniqueFieldToUsername.returns(expectedUsername);

  const result = await my.profileToDisplayName(profile);

  t.is(result, expectedUsername);
  t.true(appStub().c().uniqueFieldToUsername.calledOnce);
  t.true(appStub().c().uniqueFieldToUsername.calledWith(
    'google_email', 'test@example.com', 'abcd efg'
  ));
});