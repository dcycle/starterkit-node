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

test('profileToEmail should return username when email is valid', async t => {
  const profile = { emails: [{ value: 'test@example.com' }] };
  const expectedUsername = 'test@example.com';

  // Mocking uniqueFieldToUsername to return the expected username
  appStub().c().uniqueFieldToUsername.returns(expectedUsername);

  const result = await my.profileToEmail(profile);

  t.is(result, expectedUsername);
  t.true(appStub().c().uniqueFieldToUsername.calledOnce);
  t.true(appStub().c().uniqueFieldToUsername.calledWith(
    'google_email', 'test@example.com', 'test@example.com'
  ));
});

test('profileToGoogleEmail should throw an error if profile.emails is missing', t => {
  const profile = {};

  const error = t.throws(() => {
    my.profileToGoogleEmail(profile);
  }, { instanceOf: Error });

  t.is(error.message, 'Cannot extract email from profile: No emails found.');
});

test('profileToGoogleEmail should throw an error if profile.emails is empty', t => {
  const profile = { emails: [] };

  const error = t.throws(() => {
    my.profileToGoogleEmail(profile);
  }, { instanceOf: Error });

  t.is(error.message, 'Cannot extract email from profile: No emails found.');
});

test('profileToGoogleEmail should throw an error if email is undefined', t => {
  const profile = { emails: [{}] };

  const error = t.throws(() => {
    my.profileToGoogleEmail(profile);
  });

  t.is(error.message, 'Cannot extract email from profile.');
});

test('profileToGoogleEmail should throw an error if email is empty', t => {
  const profile = { emails: [{ value: '' }] };

  const error = t.throws(() => {
    my.profileToGoogleEmail(profile);
  });

  t.is(error.message, 'Email cannot be empty.');
});