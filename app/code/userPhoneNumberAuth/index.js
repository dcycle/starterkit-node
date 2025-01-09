
class UserPhoneNumberAuth extends require('../component/index.js') {

  async init(app) {
    super.init(app);

    return this;
  }

  dependencies() {
    return [
      './database/index.js',
    ];
  }

  loggedIn(req, res, next) {
    if (req.user) {
      next();
    } else {
      res.redirect('/login-with-phone-number');
    }
  }

  async generateToken(phoneNumber) {
    const token = await this._app.c('tokens').newToken({
      name: phoneNumber + ':token',
      permissions: ['some-permission', 'another-permission'],
      whatever: 'hello world',
      _length: 6,
      _digits_only: false,
    });

    return token;
  }

  // Send Token via your custom mechanism
  async sendToken(textframeworkSelected, phoneNumber, token) {
    // Use your existing mechanism to send the Token
    // e.g., through SMS, email, etc.
    let textObject = {
      plugin: textframeworkSelected,
      message: 'hello, your token is : ' + token,
    }
    // remove this condition later
    if (textframeworkSelected == "internal") {
      textObject.name = phoneNumber;
    }
    else {
      textObject.sendTo = phoneNumber;
    }
    console.log(textObject);
    return await this._app.c('textFramework').sendText(textObject);
  }

  // Request Token for login
  async sendTokenForLogin(req, res, next) {
    let { phoneNumber, textframeworkSelected } = req.body;
    let token;

    // Validate phoneNumber number format (you can enhance this validation)
    if (!phoneNumber) {
      return res.status(400).send('Invalid phone number');
    }

    // Remove this code later.
    if (textframeworkSelected == "internal") {
      token = await this.generateToken('robo');
    }
    else {
      token = await this.generateToken(phoneNumber);
    }

    // Send Token to the user's phoneNumber
    await this.sendToken(textframeworkSelected, phoneNumber, token);
    let info = `Kindly Enter Login Token Sent through ${textframeworkSelected} message.`;

    // return res.send(`/login-token-verify?phoneNumber=${encodeURIComponent(phoneNumber)}&info=${encodeURIComponent(info)}`);
    return res.redirect(`/login-token-verify?phoneNumber=${encodeURIComponent(phoneNumber)}&info=${encodeURIComponent(info)}&textframeworkSelected=${textframeworkSelected}`);
  }

  // Verify Token and authenticate user
  async verifyTokenAndLogin(req, res, next) {
    const { token, phoneNumber, textframeworkSelected } = req.body;
    let validToken;
    if (textframeworkSelected == "internal") {
      validToken = await this._app.c('tokens').checkToken(
        'robo:token',
        token
      );
    }
    else {
      // Validate token: Check if it exists and is valid
      // Assuming you also pass phoneNumber to ensure the correct token is checked
      validToken = await this._app.c('tokens').checkToken(
        phoneNumber + ':token',
        token
      );
    }

    if (validToken) {
      console.log("*********************** INSIDE validToken **********");
      this.userAuthenticate(req, res, next);
    } else {
      return res.redirect('/login-with-phone-number?info=Invalid or expired token. Please try again.');
    }
  }

  /**
   * Handle authentication using phoneNumber number and Token.
   */
  async userAuthenticate(req, res, next) {
    const passport = this._app.component('./authentication/index.js').passport();
    passport.authenticate('phoneNumber-token', (err, user, info) => {
      if (err) {
        console.log('Error during phone Number authentication');
        console.log(err);
        return next(err);
      }

      if (!user) {
        console.log('Phone authentication failed: ' + info.message);
        return res.redirect('/login-with-phone-number?info=' + info.message);
      }

      // If successful, log the user in and create a session
      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }

        console.log('User authenticated successfully');
        return res.redirect('/');  // Redirect to home page or dashboard
      });
    })(req, res, next);
  }

  async run(app)  {

    const authenticationWithphoneNumber = this._app.component('./authenticationWithPhone/index.js');
    if (!authenticationWithphoneNumber.initialized) {
      await authenticationWithphoneNumber.init(app);
    }

    const expressApp = app.component('./express/index.js').expressApp();

    expressApp.get('/login-with-phone-number',
      (req, res) => res.sendFile('login-with-phone-number.html',
      { root: '/usr/src/app/private' })
    );

    expressApp.get('/login-token-verify',
      (req, res) => res.sendFile('login-token-verify.html',
      { root: '/usr/src/app/private' })
    );

    expressApp.post('/auth/phone-number', async (req, res, next) => {
      await this.sendTokenForLogin(req, res, next);
    });

    expressApp.post('/login-token-verify', async (req, res, next) => {
      await this.verifyTokenAndLogin(req, res, next);
    });

    return this;
  }

}

module.exports = new UserPhoneNumberAuth();
