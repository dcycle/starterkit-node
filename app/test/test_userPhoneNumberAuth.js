// test/textUserPhoneNumberAuth.test.js
// Import dependencies for testing
const test = require('ava');
const sinon = require('sinon');
// Adjust the path to your class
const UserPhoneNumberAuth = require('/mycode/userPhoneNumberAuth/index.js');

let appMock;

test.beforeEach(async () => {
  // Create a new instance of the TextFramework and mock app
  appMock = {
    component: sinon.stub(),
    config: sinon.stub(),
    c: sinon.stub()
  };

  await UserPhoneNumberAuth.init(appMock);

});

test('verifyTokenAndLogin should authenticate user when token is valid', async (t) => {
  const req = {
    body: {
      token: 'valid-token',
      phoneNumber: '1234567890',
      textframeworkSelected: 'sms',
    },
  };
  const res = {
    redirect: sinon.stub(),
    json: sinon.stub(),
  };
  const next = sinon.stub();

  // Mocking the checkToken method to return a valid token
  // const checkTokenMock = sinon.stub().resolves(true);
  // const tokensMock = { checkToken: checkTokenMock };

  UserPhoneNumberAuth._app = { c: sinon.stub().returns(true) };
  // await this._app.c('tokens').checkToken(
  //   'robo:token',
  //   token
  // );

  // sinon.stub(TextFramework, 'getRequiredParams').returns({ whatsapp: [ 'sendTo', 'message' ] });

  // Mocking the passport.authenticate method
  const authenticateMock = sinon.stub().callsFake((strategy, callback) => {
    callback(null, { id: 1, phoneNumber: req.body.phoneNumber }, null);
  });

  UserPhoneNumberAuth._app.component = sinon.stub().returns({
    passport: sinon.stub().returns({ authenticate: authenticateMock }),
  });

  await UserPhoneNumberAuth.verifyTokenAndLogin(req, res, next);

  t.true(checkTokenMock.calledOnce, 'checkToken should be called once');
  t.true(authenticateMock.calledOnce, 'passport.authenticate should be called once');
  t.is(res.redirect.calledWith('/'), true, 'should redirect to home after successful authentication');
});
