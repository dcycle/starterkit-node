/**
 * User Phone Number Login Authentication.
 */
class UserPhoneNumberAuth extends require('../component/index.js') {

  /**
   * Initializes the UserPhoneNumberAuth component.
   *
   * @param {Object} app - The application instance.
   * @returns Promise<UserPhoneNumberAuth> - The current instance for chaining.
   */
  async init(app) {
    super.init(app);

    return this;
  }

  /**
   * Defines the dependencies required by the UserPhoneNumberAuth component.
   *
   * @returns {Array} - List of dependency file paths.
   */
  dependencies() {
    return [
      './database/index.js'
    ];
  }

  /**
   * Middleware to check if a user is logged in.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   */
  loggedIn(req, res, next) {
    if (req.user) {
      next();
    } else {
      res.redirect('/login-with-phone-number');
    }
  }

  /**
   * Generates a login token for the given phone number.
   *
   * @param {string} phoneNumber - The phone number to generate the token for.
   * @returns {Promise<string>} - The generated token.
   */
  async generateToken(phoneNumber) {
    let tokenExpiryDuration;
    // Fetch token Expiration time set in config.
    if (this._app.config().modules['./userPhoneNumberAuth/index.js'].tokenExpiryDuration) {
      tokenExpiryDuration = this._app.config().modules['./userPhoneNumberAuth/index.js'].tokenExpiryDuration;
    }

    const token = await this._app.c('tokens').newToken({
      name: phoneNumber + ':token',
      permissions: ['some-permission', 'another-permission'],
      whatever: 'hello world',
      _length: 6,
      _digits_only: false,
    }, tokenExpiryDuration);

    return token;
  }

  /**
   * Sends the generated token to the user's phone number using the
   *  selected text framework.
   *
   * @param {string} textframeworkSelected - The selected text
   *  framework (e.g., SMS or email).
   * @param {string} phoneNumber - The user's phone number.
   * @param {string} token - The generated token.
   * @returns {Promise<Object>} - Response from the text framework service.
   */
  async sendToken(textframeworkSelected, phoneNumber, token) {
    // Use existing mechanism to send the Token
    // e.g., through SMS, email, etc.
    let textObject = {
      plugin: textframeworkSelected,
      message: 'hello, your token is : ' + token
    };

    // remove this condition later when internal message is removed.
    if (textframeworkSelected == "internal") {
      // internal dont have sendTo parameter to send message hence we have to sendTo.
      textObject.name = phoneNumber;
    }
    else {
      textObject.sendTo = phoneNumber;
    }

    return await this._app.c('textFramework').sendText(textObject);
  }

  /**
   * Handles the request to send a login token to the user.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   */
  async sendTokenForLogin(req, res, next) {
    let { phoneNumber, textframeworkSelected } = req.body;
    let token;

    // Validate phoneNumber format (enhance this validation later)
    if (!phoneNumber) {
      return res.status(400).send('Invalid phone number');
    }

     // Validate textframeworkSelected or not
     if (!textframeworkSelected) {
      return res.status(400).send('Invalid text framework plugin');
    }

    // Generate token based on selected framework
    try {
      // If user wants to recieve message through internal then username has to be "robo:<token>".
      if (textframeworkSelected === "internal") {
        // For internal testing or dummy purposes
        token = await this.generateToken('robo');
      } else {
        token = await this.generateToken(phoneNumber);
      }

      // Send the token via the selected text framework (SMS, Email, etc.)
      const tokenSent = await this.sendToken(textframeworkSelected, phoneNumber, token);
      // Construct a message indicating that the token has been sent
      let info = `Kindly Enter the Login Token Sent through ${textframeworkSelected}.`;
      let response = {
        // Send phoneNumber for reference
        phoneNumber: phoneNumber,
        // Send selected framework
        textframeworkSelected: textframeworkSelected
      };

      if (tokenSent.success) {
        // This indicates that the token was sent successfully
        response.success =  true;
        response.message = info;
      }
      else if (tokenSent.errors) {
        response.success =  false;
        response.message = tokenSent.errors + ' ' + 'Kindly Check your phone number.';
      }

      return res.json(response);
    } catch (error) {
      console.error('Error while sending token:', error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while generating or sending the token. Kindly Check your phone number.',
      });
    }
  }

  /**
   * Verifies the provided token and logs in the user if valid.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   */
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
      // Validate token: Check if it is exists and is valid
      // pass phoneNumber to ensure the correct token is filtered.
      validToken = await this._app.c('tokens').checkToken(
        phoneNumber + ':token',
        token
      );
    }

    // if token is valid then authenticate user to start his login session.
    if (validToken) {
      this.userAuthenticate(req, res, next);
    } else {
      return res.redirect('/login-with-phone-number?info=Invalid or expired token. Please try again.');
    }
  }

  /**
   * Authenticates the user using the provided token and phone number.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
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
        // Redirect to home page or dashboard
        return res.redirect('/');
      });
    })(req, res, next);
  }

  /**
   * Sets up the routes and initializes necessary components.
   *
   * @param {Object} app - The application instance.
   * @returns Promise<UserPhoneNumberAuth> - The current instance for chaining.
   */
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
